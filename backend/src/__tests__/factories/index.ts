import { randomUUID } from 'crypto';

let userCounter = 0;
export function makeUser(
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    role: 'admin' | 'user';
    token_version: number;
    created_at: Date;
    updated_at: Date;
  }> = {}
) {
  userCounter++;
  return {
    id: randomUUID(),
    email: `user${userCounter}@test.com`,
    name: `Test User ${userCounter}`,
    password_hash: 'hashed_password_123',
    role: 'user' as const,
    token_version: 1,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    ...overrides,
  };
}

let postCounter = 0;
export function makePost(
  overrides: Partial<{
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    featured: boolean;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    hero_image_url: string | null;
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_tags: string[] | null;
    hero_location: string | null;
    hero_year: string | null;
    gallery_images: string[] | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }> = {}
) {
  postCounter++;
  return {
    id: randomUUID(),
    title: `Test Post ${postCounter}`,
    slug: `test-post-${postCounter}`,
    status: 'published' as const,
    featured: false,
    seo_title: null,
    seo_description: null,
    og_image_url: null,
    hero_image_url: null,
    hero_title: null,
    hero_subtitle: null,
    hero_tags: null,
    hero_location: null,
    hero_year: null,
    gallery_images: null,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    deleted_at: null,
    ...overrides,
  };
}

let blockCounter = 0;
export function makeBlock(
  overrides: Partial<{
    id: string;
    post_id: string;
    type: string;
    data: Record<string, unknown>;
    sort_order: number;
    created_at: Date;
  }> = {}
) {
  blockCounter++;
  return {
    id: randomUUID(),
    post_id: randomUUID(),
    type: 'text_full',
    data: { content: 'Test content' },
    sort_order: blockCounter,
    created_at: new Date('2024-01-01'),
    ...overrides,
  };
}

let contactCounter = 0;
export function makeContactMessage(
  overrides: Partial<{
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    telegram_sent: boolean;
    telegram_message_id: string | null;
    created_at: Date;
  }> = {}
) {
  contactCounter++;
  return {
    id: randomUUID(),
    name: `Contact ${contactCounter}`,
    email: `contact${contactCounter}@test.com`,
    subject: 'Test subject',
    message: 'Test message body',
    telegram_sent: false,
    telegram_message_id: null,
    created_at: new Date('2024-01-01'),
    ...overrides,
  };
}

export function resetCounters() {
  userCounter = 0;
  postCounter = 0;
  blockCounter = 0;
  contactCounter = 0;
}
