import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/otp";
import { sendOTPEmail } from "../services/email.service";
import "../config/env";
import { prisma } from "../db";

const router = Router();

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { message: "Too many OTP requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip || "unknown",
});

const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Too many verification attempts. Request a new OTP." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || req.ip || "unknown",
});

const MAX_OTP_ATTEMPTS = 5;

router.post("/request", otpRequestLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const otp = generateOTP();
    const hashedCode = await bcrypt.hash(otp, 10);

    await prisma.oTP.create({
      data: {
        email,
        code: hashedCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendOTPEmail(email, otp);

    return res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("[OTP] Request error:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

router.post("/verify", otpVerifyLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await prisma.oTP.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ message: "No valid OTP found. Request a new one." });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { used: true },
      });
      return res.status(429).json({ message: "Too many attempts. Request a new OTP." });
    }

    const isValid = await bcrypt.compare(otp, record.code);

    if (!isValid) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      const remaining = MAX_OTP_ATTEMPTS - record.attempts - 1;
      return res.status(400).json({
        message: "Invalid OTP",
        attemptsRemaining: remaining,
      });
    }

    await prisma.oTP.update({
      where: { id: record.id },
      data: { used: true },
    });

    return res.json({
      verified: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("[OTP] Verify error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
});

export { router as otpRoutes };
