import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; 
import * as schema from "./schema";

// Validate required environment variables
const requiredEnvVars = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("Missing required environment variables:", missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { 
    provider: "pg",
    schema: schema 
  }),
  
  // Secret key for JWT signing
  secret: process.env.BETTER_AUTH_SECRET!,
  
  // Email/password auth
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Social logins
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // Security settings
  security: {
    rateLimit: {
      window: 60, // 1 minute
      max: 10, // 10 attempts per window
    },
  },

  // Base URL for callbacks
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: [
    "http://localhost:3001",
    "https://linkbird.nikitabansal.xyz",
  ],

});
