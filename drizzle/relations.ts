import { relations } from "drizzle-orm/relations";
import { user, account, campaigns, leads, session } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	campaigns: many(campaigns),
	sessions: many(session),
}));

export const campaignsRelations = relations(campaigns, ({one, many}) => ({
	user: one(user, {
		fields: [campaigns.userId],
		references: [user.id]
	}),
	leads: many(leads),
}));

export const leadsRelations = relations(leads, ({one}) => ({
	campaign: one(campaigns, {
		fields: [leads.campaignId],
		references: [campaigns.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));