import { Router } from "express";
import { generateOTP } from "../utils/otp";
import { sendOTPEmail } from "../services/email.service";
import "../config/env";
import { prisma } from "../db";

const router = Router();

router.post("/request", async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();

  await prisma.oTP.create({
    data: {
      email,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  await sendOTPEmail(email, otp);

  return res.json({ message: "OTP sent" });
});

router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  const record = await prisma.oTP.findFirst({
    where: {
      email,
      code: otp,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  await prisma.oTP.update({
    where: { id: record.id },
    data: { used: true },
  });

  return res.json({
    verified: true,
    message: "OTP verified successfully",
  });
});

export { router as otpRoutes };