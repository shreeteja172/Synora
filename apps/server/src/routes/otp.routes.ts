import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/otp";
import { sendOTPEmail } from "../services/email.service";
import "../config/env";
import { prisma } from "../db";
import { validateBody, schemas } from "../lib/validate";
import { auth } from "./auth";

const router = Router();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { message: "Too many OTP requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || "unknown",
});

const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Too many verification attempts. Request a new OTP." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || "unknown",
});

async function findValidOtp(email: string) {
  return prisma.oTP.findFirst({
    where: {
      email,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function assertValidOtp(email: string, otp: string) {
  const record = await findValidOtp(email);

  if (!record) {
    return { ok: false as const, status: 400, message: "No valid OTP found. Request a new one." };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.oTP.update({
      where: { id: record.id },
      data: { used: true },
    });
    return { ok: false as const, status: 429, message: "Too many attempts. Request a new OTP." };
  }

  const isValid = await bcrypt.compare(otp, record.code);

  if (!isValid) {
    await prisma.oTP.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    return {
      ok: false as const,
      status: 400,
      message: "Invalid OTP",
      attemptsRemaining: MAX_OTP_ATTEMPTS - record.attempts - 1,
    };
  }

  await prisma.oTP.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { ok: true as const };
}

router.post(
  "/request",
  otpRequestLimiter,
  validateBody(schemas.otpRequest),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }

      const existingOtp = await findValidOtp(normalizedEmail);
      if (existingOtp) {
        const ageMs = Date.now() - existingOtp.createdAt.getTime();
        if (ageMs < RESEND_COOLDOWN_MS) {
          return res.json({
            message: "OTP already sent",
            alreadySent: true,
            retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - ageMs) / 1000),
          });
        }
      }

      // Invalidate previous unused OTPs before issuing a new one
      await prisma.oTP.updateMany({
        where: { email: normalizedEmail, used: false },
        data: { used: true },
      });

      const otp = generateOTP();
      const hashedCode = await bcrypt.hash(otp, 10);

      await prisma.oTP.create({
        data: {
          email: normalizedEmail,
          code: hashedCode,
          expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        },
      });

      await sendOTPEmail(normalizedEmail, otp, "email-verification");

      return res.json({ message: "OTP sent" });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/request-password-reset",
  otpRequestLimiter,
  validateBody(schemas.otpRequest),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!existingUser) {
        return res.status(404).json({
          message: "No account found with this email. Please sign up first.",
        });
      }

      const recentReset = await prisma.verification.findFirst({
        where: {
          identifier: `forget-password-otp-${normalizedEmail}`,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentReset?.createdAt) {
        const ageMs = Date.now() - recentReset.createdAt.getTime();
        if (ageMs < RESEND_COOLDOWN_MS) {
          return res.json({
            message: "Reset code already sent",
            alreadySent: true,
            retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - ageMs) / 1000),
          });
        }
      }

      await auth.api.requestPasswordResetEmailOTP({
        body: { email: normalizedEmail },
      });

      return res.json({ message: "Reset code sent" });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/complete-signup",
  otpVerifyLimiter,
  validateBody(schemas.otpCompleteSignup),
  async (req, res, next) => {
    try {
      const { email, otp, name, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const otpResult = await assertValidOtp(normalizedEmail, otp);
      if (!otpResult.ok) {
        return res.status(otpResult.status).json({
          message: otpResult.message,
          ...(otpResult.status === 400 && "attemptsRemaining" in otpResult
            ? { attemptsRemaining: otpResult.attemptsRemaining }
            : {}),
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }

      await auth.api.signUpEmail({
        body: {
          email: normalizedEmail,
          password,
          name: name.trim(),
        },
      });

      await prisma.user.update({
        where: { email: normalizedEmail },
        data: { emailVerified: true },
      });

      const signInResponse = await auth.api.signInEmail({
        body: {
          email: normalizedEmail,
          password,
        },
        asResponse: true,
      });

      const setCookieHeaders =
        typeof signInResponse.headers.getSetCookie === "function"
          ? signInResponse.headers.getSetCookie()
          : [];

      if (setCookieHeaders.length > 0) {
        for (const cookie of setCookieHeaders) {
          res.append("Set-Cookie", cookie);
        }
      } else {
        const single = signInResponse.headers.get("set-cookie");
        if (single) res.append("Set-Cookie", single);
      }

      return res.json({
        verified: true,
        message: "Account created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

export { router as otpRoutes };
