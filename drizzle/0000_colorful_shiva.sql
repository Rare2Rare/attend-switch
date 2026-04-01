CREATE TYPE "public"."response_status" AS ENUM('attending', 'absent', 'pending');--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"participant_token" varchar(64) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"status" "response_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" varchar(16) NOT NULL,
	"manage_token" varchar(64) NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"reset_time_jst" varchar(5),
	"deadline_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_reset_at" timestamp with time zone,
	CONSTRAINT "threads_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "threads_manage_token_unique" UNIQUE("manage_token")
);
--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_thread_participant_active" ON "responses" USING btree ("thread_id","participant_token") WHERE "responses"."deleted_at" IS NULL;