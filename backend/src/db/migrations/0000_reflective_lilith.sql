CREATE TYPE "public"."activity_action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."block_type" AS ENUM('text_full', 'image_full', 'text_image', 'image_text', 'three_images');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"action" "activity_action" NOT NULL,
	"entity_type" varchar(100) DEFAULT 'post' NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_title" varchar(500) NOT NULL,
	"changes" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"type" "block_type" NOT NULL,
	"data" jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"telegram_sent" boolean DEFAULT false,
	"telegram_message_id" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false,
	"seo_title" varchar(500),
	"seo_description" text,
	"og_image_url" text,
	"hero_image_url" text,
	"hero_title" varchar(500),
	"hero_subtitle" varchar(500),
	"hero_tags" text[],
	"hero_location" varchar(200),
	"hero_year" varchar(10),
	"gallery_images" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;