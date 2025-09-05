CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed');
CREATE TYPE "public"."lead_status" AS ENUM('pending', 'contacted', 'responded', 'converted');

CREATE TABLE "campaigns" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(160) NOT NULL,
    "status" "campaign_status" DEFAULT 'draft' NOT NULL,
    "total_leads" integer DEFAULT 0 NOT NULL,
    "successful_leads" integer DEFAULT 0 NOT NULL,
    "response_rate" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "leads" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar(160) NOT NULL,
    "email" varchar(190) NOT NULL,
    "company" varchar(160) DEFAULT '',
    "campaign_id" integer NOT NULL,
    "status" "lead_status" DEFAULT 'pending' NOT NULL,
    "last_contact_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "leads"
ADD CONSTRAINT "leads_campaign_id_campaigns_id_fk"
FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;
