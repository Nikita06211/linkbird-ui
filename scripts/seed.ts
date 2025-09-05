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

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if test user already exists
  let testUser;
  try {
    testUser = await db.insert(user).values({
      id: "test-user-123",
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
    }).returning();
    console.log("✅ Created test user");
  } catch (error) {
    // User already exists, get it
    testUser = await db.select().from(user).where(eq(user.id, "test-user-123"));
    console.log("✅ Test user already exists");
  }

  // Check if logged-in user already exists
  let loggedInUser;
  try {
    loggedInUser = await db.insert(user).values({
      id: "user-nikita-bansal",
      name: "nikita bansal",
      email: "nikita@example.com",
      emailVerified: true,
    }).returning();
    console.log("✅ Created logged-in user");
  } catch (error) {
    // User already exists, get it
    loggedInUser = await db.select().from(user).where(eq(user.id, "user-nikita-bansal"));
    console.log("✅ Logged-in user already exists");
  }

  // Check if campaigns already exist for the logged-in user
  const existingCampaigns = await db.select().from(campaigns).where(eq(campaigns.userId, loggedInUser[0].id));
  
  let insertedCampaigns;
  if (existingCampaigns.length === 0) {
    // Insert campaigns with userId for the logged-in user
    insertedCampaigns = await db.insert(campaigns).values([
      { name: "LinkedIn Outreach", status: "active", userId: loggedInUser[0].id },
      { name: "Email Marketing", status: "draft", userId: loggedInUser[0].id },
      { name: "Twitter DMs", status: "paused", userId: loggedInUser[0].id },
      { name: "Cold Calls", status: "active", userId: loggedInUser[0].id },
      { name: "Webinar Invites", status: "active", userId: loggedInUser[0].id },
    ]).returning();
    console.log("✅ Created campaigns for logged-in user");
  } else {
    insertedCampaigns = existingCampaigns;
    console.log("✅ Campaigns already exist for logged-in user");
  }

  console.log("✅ Campaigns inserted:", insertedCampaigns);

  // Insert leads
  await db.insert(leads).values([
    {
      name: "Alice Johnson",
      designation: "CEO",
      email: "alice@startup.com",
      company: "Startup Inc",
      campaignId: insertedCampaigns[0].id,
      status: "pending",
    },
    {
      name: "Bob Singh",
      designation: "CTO",
      email: "bob@techworld.com",
      company: "TechWorld",
      campaignId: insertedCampaigns[0].id,
      status: "contacted",
    },
    {
      name: "Charlie Patel",
      designation: "CFO",
      email: "charlie@financehub.com",
      company: "FinanceHub",
      campaignId: insertedCampaigns[1].id,
      status: "responded",
    },
    {
      name: "Daisy Kaur",
      designation: "Design Director",
      email: "daisy@designify.com",
      company: "Designify",
      campaignId: insertedCampaigns[2].id,
      status: "converted",
    },
    {
      name: "Esha Verma",
      designation: "Marketing Head",
      email: "esha@adboost.com",
      company: "AdBoost",
      campaignId: insertedCampaigns[1].id,
      status: "pending",
    },
    {
      name: "Farhan Ali",
      designation: "Product Manager",
      email: "farhan@buildit.com",
      company: "BuildIt",
      campaignId: insertedCampaigns[2].id,
      status: "contacted",
    },
    {
      name: "Gaurav Mehta",
      designation: "VP Sales",
      email: "gaurav@sellfast.com",
      company: "SellFast",
      campaignId: insertedCampaigns[3].id,
      status: "pending",
    },
    {
      name: "Hina Shah",
      designation: "HR Manager",
      email: "hina@talenthunt.com",
      company: "TalentHunt",
      campaignId: insertedCampaigns[4].id,
      status: "contacted",
    },
    {
      name: "Ishaan Khanna",
      designation: "Operations Lead",
      email: "ishaan@workify.com",
      company: "Workify",
      campaignId: insertedCampaigns[0].id,
      status: "responded",
    },
    {
      name: "Jasleen Kaur",
      designation: "Data Scientist",
      email: "jasleen@aihub.com",
      company: "AI Hub",
      campaignId: insertedCampaigns[1].id,
      status: "converted",
    },
    {
      name: "Kunal Arora",
      designation: "Engineering Manager",
      email: "kunal@devworks.com",
      company: "DevWorks",
      campaignId: insertedCampaigns[2].id,
      status: "pending",
    },
    {
      name: "Lavanya Rao",
      designation: "Business Analyst",
      email: "lavanya@insights.com",
      company: "Insights Ltd",
      campaignId: insertedCampaigns[3].id,
      status: "contacted",
    },
    {
      name: "Mohit Yadav",
      designation: "Legal Advisor",
      email: "mohit@lawify.com",
      company: "Lawify",
      campaignId: insertedCampaigns[4].id,
      status: "responded",
    },
    {
      name: "Nisha Kapoor",
      designation: "UX Designer",
      email: "nisha@creativify.com",
      company: "Creativify",
      campaignId: insertedCampaigns[0].id,
      status: "converted",
    },
    {
      name: "Omar Khan",
      designation: "Investor",
      email: "omar@venturex.com",
      company: "VentureX",
      campaignId: insertedCampaigns[1].id,
      status: "pending",
    },
  ]);

  console.log("✅ Leads inserted");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
