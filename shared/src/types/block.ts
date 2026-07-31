export type BlockType =
  | "text_full"
  | "image_full"
  | "text_image"
  | "image_text"
  | "three_images";

export interface TextFullData {
  content: string;
  label?: string;
  area?: string;
  months?: string;
  year?: string;
  [key: string]: unknown;
}

export interface ImageFullData {
  image_url: string;
  alt?: string;
  caption?: string;
  [key: string]: unknown;
}

export interface TextImageData {
  text?: string;
  image_url?: string;
  image_alt?: string;
  icon?: string;
  label?: string;
  title?: string;
  features?: string[];
  [key: string]: unknown;
}

export interface ThreeImagesData {
  images: { url: string; alt: string }[];
  [key: string]: unknown;
}

export type BlockData =
  | TextFullData
  | ImageFullData
  | TextImageData
  | ThreeImagesData;

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
  data?: Record<string, unknown>;
  sort_order?: number;
}

/** Raw block input used before runtime validation (data is Record<string, unknown>) */
export interface CreateBlockInput {
  type: BlockType;
  data: Record<string, unknown>;
  sort_order?: number;
}

/** Raw block input for bulk create/update (may include id for existing blocks) */
export interface UpsertBlockInput {
  id?: string;
  type: BlockType;
  data: Record<string, unknown>;
  sort_order: number;
}

export const BLOCK_ICONS: { value: string; label: string }[] = [
  { value: "solar:armchair-2-linear", label: "Interior" },
  { value: "solar:sun-2-linear", label: "Exterior" },
  { value: "solar:buildings-linear", label: "Architecture" },
  { value: "solar:leaf-linear", label: "Landscape" },
  { value: "solar:lightbulb-linear", label: "Lighting" },
  { value: "solar:sofa-2-linear", label: "Furniture" },
  { value: "solar:bath-linear", label: "Bathroom" },
  { value: "solar:chef-hat-linear", label: "Kitchen" },
  { value: "solar:bed-linear", label: "Bedroom" },
  { value: "solar:swimming-linear", label: "Pool" },
];
