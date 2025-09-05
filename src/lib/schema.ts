import { pgEnum, pgTable, text, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const campaignStatus = pgEnum("campaign_status", [
  "draft",
  "active",
  "paused",
  "completed",
]);

export const leadStatus = pgEnum("lead_status", [
  "pending",
  "contacted",
  "responded",
  "converted",
]);

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  status: campaignStatus("status").default("draft").notNull(),
  totalLeads: integer("total_leads").default(0).notNull(),
  successfulLeads: integer("successful_leads").default(0).notNull(),
  responseRate: integer("response_rate").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  status: leadStatus("status").default("pending").notNull(),
  lastContactAt: timestamp("last_contact_at").defaultNow(),
  avatarUrl: text("avatar_url"),

  // foreign key to campaigns
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaigns.id),
});

// Relations
export const campaignRelations = relations(campaigns, ({ many }) => ({
  leads: many(leads),
}));

export const leadRelations = relations(leads, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [leads.campaignId],
    references: [campaigns.id],
  }),
}));
