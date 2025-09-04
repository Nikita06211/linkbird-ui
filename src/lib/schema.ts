import { pgEnum, pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
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
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 190 }).notNull(),
  company: varchar("company", { length: 160 }).default(""),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  status: leadStatus("status").default("pending").notNull(),
  lastContactAt: timestamp("last_contact_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignRelations = relations(campaigns, ({ many }) => ({
  leads: many(leads),
}));
