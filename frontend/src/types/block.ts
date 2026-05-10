import type { Block } from '@buro710/shared';

export interface BlockWithFile {
  id: string;
  file: File | null;
}

export interface EditBlock extends Omit<Block, 'id' | 'post_id' | 'created_at'> {
  id?: string;
  post_id?: string;
  created_at?: string;
  _tempId?: string;
}
