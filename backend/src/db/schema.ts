import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const postStatusEnum = pgEnum('post_status', ['draft', 'published']);
export const blockTypeEnum = pgEnum('block_type', [
  'text_full',
  'image_full',
  'text_image',
  'image_text',
  'three_images',
]);
export const activityActionEnum = pgEnum('activity_action', ['create', 'update', 'delete']);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 500 }).notNull(),
    status: postStatusEnum('status').default('draft').notNull(),
    featured: boolean('featured').default(false),
    seo_title: varchar('seo_title', { length: 500 }),
    seo_description: text('seo_description'),
    og_image_url: text('og_image_url'),
    hero_image_url: text('hero_image_url'),
    hero_title: varchar('hero_title', { length: 500 }),
    hero_subtitle: varchar('hero_subtitle', { length: 500 }),
    hero_tags: text('hero_tags').array(),
    hero_location: varchar('hero_location', { length: 200 }),
    hero_year: varchar('hero_year', { length: 10 }),
    gallery_images: text('gallery_images').array(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    // Guards against duplicate slugs among active posts (soft-deleted posts may keep theirs)
    uniqueIndex('posts_slug_active_unique')
      .on(t.slug)
      .where(sql`${t.deleted_at} is null`),
    index('posts_status_created_at_idx')
      .on(t.status, t.created_at)
      .where(sql`${t.deleted_at} is null`),
  ]
);

export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    post_id: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    type: blockTypeEnum('type').notNull(),
    data: jsonb('data').notNull().$type<Record<string, unknown>>(),
    sort_order: integer('sort_order').default(0).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('blocks_post_id_idx').on(t.post_id)]
);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('admin').notNull(),
  token_version: integer('token_version').default(0).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token_hash: varchar('token_hash', { length: 255 }).notNull(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('refresh_tokens_user_id_idx').on(t.user_id)]
);

export const activityLogs = pgTable(
  'activity_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_email: varchar('user_email', { length: 255 }).notNull(),
    action: activityActionEnum('action').notNull(),
    entity_type: varchar('entity_type', { length: 100 }).default('post').notNull(),
    entity_id: uuid('entity_id').notNull(),
    entity_title: varchar('entity_title', { length: 500 }).notNull(),
    changes: jsonb('changes').default({}).$type<Record<string, unknown>>(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('activity_logs_created_at_idx').on(t.created_at)]
);

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 500 }).notNull(),
  message: text('message').notNull(),
  telegram_sent: boolean('telegram_sent').default(false),
  telegram_message_id: varchar('telegram_message_id', { length: 100 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
