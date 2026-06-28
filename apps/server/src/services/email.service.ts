import { transporter } from "../lib/mailer";
import "../config/env";

export const sendOTPEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: sans-serif">
        <h2>Login OTP</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing: 5px">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `,
  });
};