import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; 
import * as schema from "./schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { 
    provider: "pg",
    schema: schema 
  }),
  
  // Email/password auth
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Social logins
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3001",
  
  // Trusted origins
  trustedOrigins: [
    "http://localhost:3001",
    "https://localhost:3001",
  ],
});
