import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "../db";
import "../config/env";
import { sendOTPEmail } from "../services/email.service";

const isProduction = process.env.NODE_ENV === "production";

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
    defaultCookieAttributes: {
      secure: isProduction,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        void sendOTPEmail(email, otp, type);
      },
    }),
  ],
});
