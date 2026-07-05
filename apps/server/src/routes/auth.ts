import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";
import "../config/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:3000"],

  session: {
    cookieCache: {
      enabled: false,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      secure: true,
      httpOnly: true,
      sameSite: "none", 
      partitioned: true,
    },
  },

  emailAndPassword: {
    enabled: true,
  },
  account: {
    skipStateCookieCheck: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
