import { db } from "../src/lib/db";
import { campaigns, leads } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function checkCampaign28() {
  try {
    console.log("Checking campaign 28...");
    
    // Check if campaign 28 exists
    const campaign = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, 28))
      .limit(1);
    
    console.log("Campaign 28:", campaign[0] || "NOT FOUND");
    
    // Check if there are any leads for campaign 28
    const campaignLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.campaignId, 28));
    
    console.log("Leads for campaign 28:", campaignLeads.length, "leads found");
    console.log("Leads:", campaignLeads);
    
    // Check all campaigns
    const allCampaigns = await db.select().from(campaigns);
    console.log("All campaigns:", allCampaigns.map(c => ({ id: c.id, name: c.name, userId: c.userId })));
    
    // Check all leads
    const allLeads = await db.select().from(leads);
    console.log("All leads:", allLeads.map(l => ({ id: l.id, name: l.name, campaignId: l.campaignId })));
    
  } catch (error) {
    console.error("Error checking campaign 28:", error);
  }
}

checkCampaign28();
