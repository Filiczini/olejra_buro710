export {
  postCreateSchema,
  postUpdateSchema,
  blockSchema,
  blockDataSchema,
  type PostCreateInput,
  type PostUpdateInput,
} from "./schemas/post.js";

export { contactSchema, type ContactInput } from "./schemas/contact.js";

export {
  loginSchema,
  userCreateSchema,
  type LoginInput,
  type UserCreateInput,
} from "./schemas/auth.js";

export { transliterate, generateSlug } from "./transliterate.js";

export {
  postResponseSchema,
  blockResponseSchema,
  paginatedPostResponseSchema,
  postWithBlocksResponseSchema,
  contactResponseSchema,
  errorResponseSchema,
  messageResponseSchema,
} from "./schemas/api.js";

export type {
  PostStatus,
  PostHero,
  Post,
  CreatePostData,
  UpdatePostData,
  PostPaginationParams,
  PaginatedResponse,
} from "./types/post.js";

export type {
  BlockType,
  BlockData,
  TextFullData,
  ImageFullData,
  TextImageData,
  ThreeImagesData,
  Block,
  CreateBlockData,
  UpdateBlockData,
  CreateBlockInput,
  UpsertBlockInput,
} from "./types/block.js";
export { BLOCK_ICONS } from "./types/block.js";

export type { LoginCredentials } from "./types/auth.js";

export type {
  ContactFormData,
  ContactMessage,
  ContactSubmitResponse,
} from "./types/contact.js";

export type {
  ActivityAction,
  ActivityLog,
  ActivityChanges,
  ActivityLogsParams,
} from "./types/activityLog.js";

export type { User } from "./types/user.js";
