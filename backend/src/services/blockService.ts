import { supabase } from '../config/supabase';
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

export const blockService = {
  getByPostId: async (postId: string): Promise<Block[]> => {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('post_id', postId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return (data || []) as Block[];
  },

  create: async (params: CreateBlocksParams): Promise<Block[]> => {
    const blocks = params.blocks.map((block, index) => ({
      post_id: params.postId,
      type: block.type,
      data: block.data,
      sort_order: block.sort_order ?? index,
    }));

    const { data, error } = await supabase
      .from('blocks')
      .insert(blocks)
      .select();

    if (error) throw error;
    return (data || []) as Block[];
  },

  update: async (id: string, data: UpdateBlockData): Promise<Block> => {
    const { data: block, error } = await supabase
      .from('blocks')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return block as Block;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  deleteByPostId: async (postId: string): Promise<void> => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('post_id', postId);

    if (error) throw error;
  },

  reorder: async (params: ReorderBlocksParams): Promise<Block[]> => {
    const updates = params.blockOrders.map(({ id, sort_order }) =>
      supabase
        .from('blocks')
        .update({ sort_order })
        .eq('id', id)
        .eq('post_id', params.postId)
    );

    await Promise.all(updates);

    return blockService.getByPostId(params.postId);
  },

  syncBlocks: async (
    postId: string,
    blocks: { id?: string; type: BlockType; data: BlockData; sort_order: number }[]
  ): Promise<Block[]> => {
    const existingBlocks = await blockService.getByPostId(postId);
    const existingIds = new Set(existingBlocks.map(b => b.id));
    const incomingIds = new Set(blocks.filter(b => b.id).map(b => b.id));

    const toDelete = existingBlocks.filter(b => !incomingIds.has(b.id));
    const toCreate: { type: BlockType; data: BlockData; sort_order: number }[] = [];
    const toUpdate: { id: string; type: BlockType; data: BlockData; sort_order: number }[] = [];

    for (const block of blocks) {
      if (block.id && existingIds.has(block.id)) {
        toUpdate.push(block as { id: string; type: BlockType; data: BlockData; sort_order: number });
      } else {
        toCreate.push({ type: block.type, data: block.data, sort_order: block.sort_order });
      }
    }

    if (toDelete.length > 0) {
      await Promise.all(toDelete.map(b => blockService.delete(b.id)));
    }

    if (toCreate.length > 0) {
      await blockService.create({ postId, blocks: toCreate });
    }

    for (const block of toUpdate) {
      await blockService.update(block.id, { type: block.type, data: block.data, sort_order: block.sort_order });
    }

    return blockService.getByPostId(postId);
  },
};
