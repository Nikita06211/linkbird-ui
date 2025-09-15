import { db } from "../src/lib/db";
import { campaigns } from "../src/lib/schema";

async function createTestCampaign() {
  try {
    console.log("Creating test campaign...");
    
    const newCampaign = await db.insert(campaigns).values({
      name: "Test Campaign",
      status: "active",
      userId: "test-user-123", // Use the test user ID
    }).returning();
    
    console.log("Created campaign:", newCampaign[0]);
    console.log("Campaign ID:", newCampaign[0].id);
    
    // Also create one for the real user
    const realUserCampaign = await db.insert(campaigns).values({
      name: "Real User Campaign",
      status: "draft",
      userId: "E1o3GRGuUxUOj9mc8p0GzKhaN2OIhdVd", // Your real user ID
    }).returning();
    
    console.log("Created real user campaign:", realUserCampaign[0]);
    console.log("Real User Campaign ID:", realUserCampaign[0].id);
    
  } catch (error) {
    console.error("Error creating test campaign:", error);
  }
}

createTestCampaign();
