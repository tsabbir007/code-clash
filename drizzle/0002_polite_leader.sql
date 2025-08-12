CREATE TABLE "contest_announcement" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_important" boolean DEFAULT false,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_clarification" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"problem_id" integer,
	"question" text NOT NULL,
	"answer" text,
	"status" text DEFAULT 'pending',
	"asked_by" text NOT NULL,
	"answered_by" text,
	"asked_at" timestamp NOT NULL,
	"answered_at" timestamp,
	"is_public" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "contest_moderator" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"permissions" text DEFAULT 'full',
	"added_by" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_standing" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"total_score" integer DEFAULT 0,
	"problems_solved" integer DEFAULT 0,
	"penalty" integer DEFAULT 0,
	"last_submission_time" timestamp,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contest_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"problem_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"language" text NOT NULL,
	"source_code" text NOT NULL,
	"verdict" text DEFAULT 'Pending',
	"cpu_time" integer DEFAULT 0,
	"memory_usage" integer DEFAULT 0,
	"score" integer DEFAULT 0,
	"test_cases_passed" integer DEFAULT 0,
	"total_test_cases" integer DEFAULT 0,
	"submission_time" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contest_announcement" ADD CONSTRAINT "contest_announcement_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_announcement" ADD CONSTRAINT "contest_announcement_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_clarification" ADD CONSTRAINT "contest_clarification_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_clarification" ADD CONSTRAINT "contest_clarification_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_clarification" ADD CONSTRAINT "contest_clarification_asked_by_user_id_fk" FOREIGN KEY ("asked_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_clarification" ADD CONSTRAINT "contest_clarification_answered_by_user_id_fk" FOREIGN KEY ("answered_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_moderator" ADD CONSTRAINT "contest_moderator_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_moderator" ADD CONSTRAINT "contest_moderator_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_moderator" ADD CONSTRAINT "contest_moderator_added_by_user_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_standing" ADD CONSTRAINT "contest_standing_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_standing" ADD CONSTRAINT "contest_standing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_contest_id_contest_id_fk" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_problem_id_problem_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contest_submission" ADD CONSTRAINT "contest_submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;