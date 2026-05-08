import type { Block } from '@buro710/shared';

export interface EditBlock extends Omit<Block, 'id' | 'post_id' | 'created_at'> {
  id?: string;
  _tempId?: string;
}
