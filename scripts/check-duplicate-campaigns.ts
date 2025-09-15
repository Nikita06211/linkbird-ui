import { db } from "../src/lib/db";
import { campaigns } from "../src/lib/schema";
import { sql } from "drizzle-orm";

async function checkDuplicateCampaigns() {
  try {
    console.log("Checking for duplicate campaign names...");
    
    // Get all campaigns
    const allCampaigns = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        userId: campaigns.userId,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .orderBy(campaigns.name, campaigns.createdAt);
    
    console.log("All campaigns:");
    allCampaigns.forEach(campaign => {
      console.log(`ID: ${campaign.id}, Name: "${campaign.name}", Status: ${campaign.status}, User: ${campaign.userId}, Created: ${campaign.createdAt}`);
    });
    
    // Check for duplicate names
    const duplicateNames = await db
      .select({
        name: campaigns.name,
        count: sql<number>`count(*)`.as('count')
      })
      .from(campaigns)
      .groupBy(campaigns.name)
      .having(sql`count(*) > 1`);
    
    console.log("\nDuplicate campaign names:");
    duplicateNames.forEach(dup => {
      console.log(`"${dup.name}" appears ${dup.count} times`);
    });
    
    // Check campaigns with same name and same user
    const duplicateNamesSameUser = await db
      .select({
        name: campaigns.name,
        userId: campaigns.userId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(campaigns)
      .groupBy(campaigns.name, campaigns.userId)
      .having(sql`count(*) > 1`);
    
    console.log("\nDuplicate campaign names for same user:");
    duplicateNamesSameUser.forEach(dup => {
      console.log(`"${dup.name}" for user ${dup.userId} appears ${dup.count} times`);
    });
    
  } catch (error) {
    console.error("Error checking duplicate campaigns:", error);
  }
}

checkDuplicateCampaigns();
