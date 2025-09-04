import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; 
import * as schema from "./schema";

export const auth = betterAuth({
  adapter: drizzleAdapter(db, { provider: "pg" }),
  
  // Email/password auth
  emailAndPassword: {
    enabled: true,
  },

  // Social logins
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
