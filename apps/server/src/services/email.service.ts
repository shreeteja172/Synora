import axios from "axios";
import "../config/env";

type OtpEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const getSubject = (type: OtpEmailType) => {
  switch (type) {
    case "sign-in":
      return "Your Synora sign-in code";
    case "email-verification":
      return "Verify your Synora email";
    default:
      return "Your Synora verification code";
  }
};

export const sendOTPEmail = async (
  email: string,
  otp: string,
  type: OtpEmailType = "sign-in",
) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "Synora",
      },
      to: [{ email }],
      subject: getSubject(type),
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111;">Your verification code</h2>
          <p style="color: #555;">Enter this code to continue:</p>
          <h1 style="letter-spacing: 8px; color: #10b981;">${otp}</h1>
          <p style="color: #888; font-size: 14px;">This code expires in 5 minutes.</p>
        </div>
      `,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    },
  );
};
