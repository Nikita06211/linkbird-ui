ALTER TABLE "leads" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "company" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "company" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "last_contact_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "designation" text NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "leads" DROP COLUMN "created_at";