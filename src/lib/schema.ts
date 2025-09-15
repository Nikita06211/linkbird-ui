import { pgEnum, pgTable, text, serial, varchar, timestamp, integer, boolean, uuid, unique } from "drizzle-orm/pg-core";
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

// Better Auth required tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  status: campaignStatus("status").default("draft").notNull(),
  totalLeads: integer("total_leads").default(0).notNull(),
  successfulLeads: integer("successful_leads").default(0).notNull(),
  responseRate: integer("response_rate").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}, (table) => [
  // Add unique constraint for name + userId combination
  unique("campaigns_name_user_unique").on(table.name, table.userId),
]);

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
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  campaigns: many(campaigns),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const campaignRelations = relations(campaigns, ({ many, one }) => ({
  leads: many(leads),
  user: one(user, {
    fields: [campaigns.userId],
    references: [user.id],
  }),
}));

export const leadRelations = relations(leads, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [leads.campaignId],
    references: [campaigns.id],
  }),
}));
