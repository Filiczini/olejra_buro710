import { eq, asc } from 'drizzle-orm';
import { db, type DbClient } from '../db';
import { blocks } from '../db/schema';
import { blockDataSchema } from '@buro710/shared';
import type {
  Block,
  BlockType,
  UpdateBlockData,
  CreateBlockInput,
  UpsertBlockInput,
} from '@buro710/shared';

interface CreateBlocksParams {
  postId: string;
  blocks: CreateBlockInput[];
}

interface ReorderBlocksParams {
  postId: string;
  blockOrders: { id: string; sort_order: number }[];
}

function toBlock(row: typeof blocks.$inferSelect): Block {
  return {
    id: row.id,
    post_id: row.post_id,
    type: row.type as BlockType,
    data: blockDataSchema.parse(row.data),
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
  };
}

export const blockService = {
  getByPostId: async (postId: string, executor: DbClient = db): Promise<Block[]> => {
    const result = await executor
      .select()
      .from(blocks)
      .where(eq(blocks.post_id, postId))
      .orderBy(asc(blocks.sort_order));

    return result.map(toBlock);
  },

  create: async (params: CreateBlocksParams, executor: DbClient = db): Promise<Block[]> => {
    const values = params.blocks.map((block, index) => ({
      post_id: params.postId,
      type: block.type,
      data: blockDataSchema.parse(block.data),
      sort_order: block.sort_order ?? index,
    }));

    const result = await executor.insert(blocks).values(values).returning();

    return result.map(toBlock);
  },

  update: async (id: string, data: UpdateBlockData, executor: DbClient = db): Promise<Block> => {
    const updateValues: Record<string, unknown> = {};
    if (data.type !== undefined) updateValues.type = data.type;
    if (data.data !== undefined) updateValues.data = data.data;
    if (data.sort_order !== undefined) updateValues.sort_order = data.sort_order;

    const [result] = await executor
      .update(blocks)
      .set(updateValues)
      .where(eq(blocks.id, id))
      .returning();

    if (!result) throw new Error('Block not found');

    return toBlock(result);
  },

  delete: async (id: string, executor: DbClient = db): Promise<void> => {
    await executor.delete(blocks).where(eq(blocks.id, id));
  },

  deleteByPostId: async (postId: string, executor: DbClient = db): Promise<void> => {
    await executor.delete(blocks).where(eq(blocks.post_id, postId));
  },

  reorder: async (params: ReorderBlocksParams): Promise<Block[]> => {
    await db.transaction(async (tx) => {
      for (const { id, sort_order } of params.blockOrders) {
        await tx.update(blocks).set({ sort_order }).where(eq(blocks.id, id));
      }
    });

    return blockService.getByPostId(params.postId);
  },

  syncBlocks: async (
    postId: string,
    incomingBlocks: UpsertBlockInput[],
    executor?: DbClient
  ): Promise<Block[]> => {
    // Without a caller-provided transaction, open our own so delete/create/update stay atomic
    if (!executor) {
      return db.transaction((tx) => blockService.syncBlocks(postId, incomingBlocks, tx));
    }

    const existingBlocks = await blockService.getByPostId(postId, executor);
    const existingIds = new Set(existingBlocks.map((b) => b.id));
    const incomingIds = new Set(incomingBlocks.filter((b) => b.id).map((b) => b.id));

    const toDelete = existingBlocks.filter((b) => !incomingIds.has(b.id));
    const toCreate: { type: BlockType; data: Record<string, unknown>; sort_order: number }[] = [];
    const toUpdate: {
      id: string;
      type: BlockType;
      data: Record<string, unknown>;
      sort_order: number;
    }[] = [];

    for (const block of incomingBlocks) {
      if (block.id && existingIds.has(block.id)) {
        toUpdate.push({ ...block, id: block.id });
      } else {
        toCreate.push({ type: block.type, data: block.data, sort_order: block.sort_order });
      }
    }

    for (const block of toDelete) {
      await blockService.delete(block.id, executor);
    }

    const createdBlocks =
      toCreate.length > 0 ? await blockService.create({ postId, blocks: toCreate }, executor) : [];

    const updatedBlocks: Block[] = [];
    for (const block of toUpdate) {
      updatedBlocks.push(
        await blockService.update(
          block.id,
          { type: block.type, data: block.data, sort_order: block.sort_order },
          executor
        )
      );
    }

    return [...createdBlocks, ...updatedBlocks].sort((a, b) => a.sort_order - b.sort_order);
  },
};
