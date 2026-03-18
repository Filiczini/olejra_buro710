import { eq, asc } from 'drizzle-orm';
import { db } from '../db';
import { blocks } from '../db/schema';
import type { Block, BlockType, BlockData, UpdateBlockData } from '../types/block';

interface CreateBlocksParams {
  postId: string;
  blocks: {
    type: BlockType;
    data: BlockData;
    sort_order?: number;
  }[];
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
    data: row.data as unknown as BlockData,
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
  };
}

export const blockService = {
  getByPostId: async (postId: string): Promise<Block[]> => {
    const result = await db
      .select()
      .from(blocks)
      .where(eq(blocks.post_id, postId))
      .orderBy(asc(blocks.sort_order));

    return result.map(toBlock);
  },

  create: async (params: CreateBlocksParams): Promise<Block[]> => {
    const values = params.blocks.map((block, index) => ({
      post_id: params.postId,
      type: block.type,
      data: block.data as unknown as Record<string, unknown>,
      sort_order: block.sort_order ?? index,
    }));

    const result = await db.insert(blocks).values(values).returning();

    return result.map(toBlock);
  },

  update: async (id: string, data: UpdateBlockData): Promise<Block> => {
    const updateValues: Record<string, unknown> = {};
    if (data.type !== undefined) updateValues.type = data.type;
    if (data.data !== undefined) updateValues.data = data.data;
    if (data.sort_order !== undefined) updateValues.sort_order = data.sort_order;

    const [result] = await db.update(blocks).set(updateValues).where(eq(blocks.id, id)).returning();

    if (!result) throw new Error('Block not found');

    return toBlock(result);
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(blocks).where(eq(blocks.id, id));
  },

  deleteByPostId: async (postId: string): Promise<void> => {
    await db.delete(blocks).where(eq(blocks.post_id, postId));
  },

  reorder: async (params: ReorderBlocksParams): Promise<Block[]> => {
    const updates = params.blockOrders.map(({ id, sort_order }) =>
      db.update(blocks).set({ sort_order }).where(eq(blocks.id, id))
    );

    await Promise.all(updates);

    return blockService.getByPostId(params.postId);
  },

  syncBlocks: async (
    postId: string,
    incomingBlocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]
  ): Promise<Block[]> => {
    const existingBlocks = await blockService.getByPostId(postId);
    const existingIds = new Set(existingBlocks.map((b) => b.id));
    const incomingIds = new Set(incomingBlocks.filter((b) => b.id).map((b) => b.id));

    const toDelete = existingBlocks.filter((b) => !incomingIds.has(b.id));
    const toCreate: { type: BlockType; data: BlockData; sort_order: number }[] = [];
    const toUpdate: { id: string; type: BlockType; data: BlockData; sort_order: number }[] = [];

    for (const block of incomingBlocks) {
      if (block.id && existingIds.has(block.id)) {
        toUpdate.push(
          block as { id: string; type: BlockType; data: BlockData; sort_order: number }
        );
      } else {
        toCreate.push({ type: block.type, data: block.data, sort_order: block.sort_order });
      }
    }

    const deletePromise =
      toDelete.length > 0
        ? Promise.all(toDelete.map((b) => blockService.delete(b.id)))
        : Promise.resolve([]);

    const createPromise =
      toCreate.length > 0
        ? blockService.create({ postId, blocks: toCreate })
        : Promise.resolve([] as Block[]);

    const updatePromise =
      toUpdate.length > 0
        ? Promise.all(
            toUpdate.map((block) =>
              blockService.update(block.id, {
                type: block.type,
                data: block.data,
                sort_order: block.sort_order,
              })
            )
          )
        : Promise.resolve([] as Block[]);

    const [, createdBlocks, updatedBlocks] = await Promise.all([
      deletePromise,
      createPromise,
      updatePromise,
    ]);

    return [...createdBlocks, ...updatedBlocks].sort((a, b) => a.sort_order - b.sort_order);
  },
};
