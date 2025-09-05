import { campaigns, leads } from "@/lib/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log("🌱 Seeding database...");

  // Insert campaigns
  const insertedCampaigns = await db.insert(campaigns).values([
    { name: "LinkedIn Outreach", status: "active" },
    { name: "Email Marketing", status: "draft" },
    { name: "Twitter DMs", status: "paused" },
    { name: "Cold Calls", status: "active" },
    { name: "Webinar Invites", status: "active" },
  ]).returning();

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
