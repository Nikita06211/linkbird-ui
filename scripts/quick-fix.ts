import { campaigns, leads, user } from "@/lib/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function quickFix() {
  console.log("🔧 Quick fix: Adding test data...");

  try {
    // First, let's see what users exist
    const allUsers = await db.select().from(user);
    console.log("Existing users:", allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));

    // Get the first user (likely the logged-in user)
    const currentUser = allUsers[0];
    if (!currentUser) {
      console.log("No users found, creating a test user...");
      const newUser = await db.insert(user).values({
        id: "user-current",
        name: "Current User",
        email: "current@example.com",
        emailVerified: true,
      }).returning();
      currentUser = newUser[0];
    }

    console.log("Using user:", currentUser.id, currentUser.name);

    // Check if campaigns already exist for this user
    const existingCampaigns = await db.select().from(campaigns).where(eq(campaigns.userId, currentUser.id));
    console.log("Existing campaigns for user:", existingCampaigns.length);

    if (existingCampaigns.length === 0) {
      // Insert some test campaigns
      const newCampaigns = await db.insert(campaigns).values([
        { name: "LinkedIn Outreach", status: "active", userId: currentUser.id },
        { name: "Email Marketing", status: "draft", userId: currentUser.id },
        { name: "Twitter DMs", status: "paused", userId: currentUser.id },
        { name: "Cold Calls", status: "active", userId: currentUser.id },
        { name: "Webinar Invites", status: "active", userId: currentUser.id },
      ]).returning();

      console.log("✅ Created campaigns:", newCampaigns.length);

      // Insert some test leads
      await db.insert(leads).values([
        {
          name: "Alice Johnson",
          designation: "CEO",
          email: "alice@startup.com",
          company: "Startup Inc",
          campaignId: newCampaigns[0].id,
          status: "pending",
        },
        {
          name: "Bob Singh",
          designation: "CTO",
          email: "bob@techworld.com",
          company: "TechWorld",
          campaignId: newCampaigns[0].id,
          status: "contacted",
        },
        {
          name: "Charlie Patel",
          designation: "CFO",
          email: "charlie@financehub.com",
          company: "FinanceHub",
          campaignId: newCampaigns[1].id,
          status: "responded",
        },
        {
          name: "Daisy Kaur",
          designation: "Design Director",
          email: "daisy@designify.com",
          company: "Designify",
          campaignId: newCampaigns[2].id,
          status: "converted",
        },
        {
          name: "Esha Verma",
          designation: "Marketing Head",
          email: "esha@adboost.com",
          company: "AdBoost",
          campaignId: newCampaigns[1].id,
          status: "pending",
        },
      ]);

      console.log("✅ Created leads");
    } else {
      console.log("Campaigns already exist for this user");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

quickFix();
