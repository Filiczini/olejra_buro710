CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "blocks_post_id_idx" ON "blocks" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_active_unique" ON "posts" USING btree ("slug") WHERE "posts"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "posts_status_created_at_idx" ON "posts" USING btree ("status","created_at") WHERE "posts"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");