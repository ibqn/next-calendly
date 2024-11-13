CREATE SCHEMA IF NOT EXISTS "drizzle";
--> statement-breakpoint
CREATE TYPE "drizzle"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drizzle"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"duration_in_minutes" integer NOT NULL,
	"clerk_user_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drizzle"."schedule_availabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"start_time" text NOT NULL,
	"end_time" timestamp NOT NULL,
	"day_of_week" "drizzle"."day_of_week" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drizzle"."schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timezone" text NOT NULL,
	"clerk_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schedules_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "drizzle"."schedule_availabilities" ADD CONSTRAINT "schedule_availabilities_schedule_id_schedules_id_fk" FOREIGN KEY ("schedule_id") REFERENCES "drizzle"."schedules"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clerkUserIdIndex" ON "drizzle"."events" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scheduleIdIndex" ON "drizzle"."schedule_availabilities" USING btree ("schedule_id");
