import { pgTable, text, timestamp, unique, boolean, foreignKey, serial, varchar, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const campaignStatus = pgEnum("campaign_status", ['draft', 'active', 'paused', 'completed'])
export const leadStatus = pgEnum("lead_status", ['pending', 'contacted', 'responded', 'converted'])


export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const campaigns = pgTable("campaigns", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 160 }).notNull(),
	status: campaignStatus().default('draft').notNull(),
	totalLeads: integer("total_leads").default(0).notNull(),
	successfulLeads: integer("successful_leads").default(0).notNull(),
	responseRate: integer("response_rate").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "campaigns_user_id_user_id_fk"
		}).onDelete("cascade"),
	// Add unique constraint for name + userId combination
	unique("campaigns_name_user_unique").on(table.name, table.userId),
]);

export const leads = pgTable("leads", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	designation: text().notNull(),
	email: text().notNull(),
	company: text(),
	status: leadStatus().default('pending').notNull(),
	lastContactAt: timestamp("last_contact_at", { mode: 'string' }).defaultNow(),
	avatarUrl: text("avatar_url"),
	campaignId: integer("campaign_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [campaigns.id],
			name: "leads_campaign_id_campaigns_id_fk"
		}),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);
