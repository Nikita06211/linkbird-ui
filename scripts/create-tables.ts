import postgres from "postgres";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

async function createTables() {
  console.log("🔄 Creating database tables...");
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(process.env.DATABASE_URL, { prepare: false });

  try {
    // Create user table
    await client`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "image" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✅ Created user table");

    // Create session table
    await client`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY,
        "expiresAt" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `;
    console.log("✅ Created session table");

    // Create account table
    await client`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "accessToken" text,
        "refreshToken" text,
        "idToken" text,
        "accessTokenExpiresAt" timestamp,
        "refreshTokenExpiresAt" timestamp,
        "scope" text,
        "password" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✅ Created account table");

    // Create verification table
    await client`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✅ Created verification table");

    // Create campaigns table
    await client`
      CREATE TABLE IF NOT EXISTS "campaigns" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "status" text NOT NULL DEFAULT 'draft',
        "userId" text NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✅ Created campaigns table");

    // Create leads table
    await client`
      CREATE TABLE IF NOT EXISTS "leads" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "designation" text,
        "email" text NOT NULL,
        "company" text,
        "status" text NOT NULL DEFAULT 'pending',
        "campaignId" integer REFERENCES "campaigns"("id") ON DELETE CASCADE,
        "lastContactAt" timestamp,
        "avatarUrl" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `;
    console.log("✅ Created leads table");

    console.log("🎉 All tables created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createTables()
  .then(() => {
    console.log("✅ Database setup completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database setup failed:", error);
    process.exit(1);
  });
