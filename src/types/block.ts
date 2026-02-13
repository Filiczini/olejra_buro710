export type PostStatus = 'draft' | 'published';
export type BlockType = 'text_full' | 'image_full' | 'text_image' | 'image_text';

export interface TextFullData {
  content: string;
}

export interface ImageFullData {
  image_url: string;
  alt?: string;
}

export interface TextImageData {
  text: string;
  image_url: string;
  image_alt?: string;
}

export type BlockData = TextFullData | ImageFullData | TextImageData;

export interface Block {
  id: string;
  post_id: string;
  type: BlockType;
  data: BlockData;
  sort_order: number;
  created_at: string;
}

export interface CreateBlockData {
  type: BlockType;
  data: BlockData;
  sort_order?: number;
}

export interface UpdateBlockData {
  type?: BlockType;
  data?: BlockData;
  sort_order?: number;
}
