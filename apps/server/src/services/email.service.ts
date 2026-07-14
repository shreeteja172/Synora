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
    case "forget-password":
      return "Reset your Synora password";
    default:
      return "Your Synora verification code";
  }
};

const getHeadline = (type: OtpEmailType) => {
  switch (type) {
    case "sign-in":
      return "Sign in to Synora";
    case "email-verification":
      return "Verify your email";
    case "forget-password":
      return "Reset your password";
    default:
      return "Your verification code";
  }
};

const getIntro = (type: OtpEmailType) => {
  switch (type) {
    case "sign-in":
      return "Use the code below to finish signing in to your Synora account.";
    case "email-verification":
      return "Welcome to Synora. Enter the code below to verify your email and start chatting.";
    case "forget-password":
      return "We received a request to reset your password. Enter the code below to continue.";
    default:
      return "Enter the code below to continue with Synora.";
  }
};

const buildOtpEmailHtml = (otp: string, type: OtpEmailType) => {
  const headline = getHeadline(type);
  const intro = getIntro(type);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${getSubject(type)}</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1a1a1a;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="width:36px;height:36px;background-color:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);border-radius:10px;text-align:center;vertical-align:middle;">
                    <span style="display:inline-block;color:#10B981;font-size:18px;font-weight:700;line-height:36px;">S</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:15px;font-weight:600;letter-spacing:-0.02em;">Synora</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 16px;text-align:center;">
              <h1 style="margin:0 0 12px;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.03em;line-height:1.3;">
                ${headline}
              </h1>
              <p style="margin:0;color:#71717a;font-size:14px;line-height:1.6;">
                ${intro}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;text-align:center;">
              <div style="display:inline-block;background-color:#111111;border:1px solid #1a1a1a;border-radius:16px;padding:20px 28px;">
                <p style="margin:0 0 8px;color:#3f3f46;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">
                  Verification code
                </p>
                <p style="margin:0;color:#10B981;font-size:36px;font-weight:700;letter-spacing:0.35em;line-height:1.2;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
                  ${otp}
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <p style="margin:0;color:#3f3f46;font-size:13px;line-height:1.5;">
                This code expires in <span style="color:#a1a1aa;">5 minutes</span>.
                If you didn&apos;t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#050505;border-top:1px solid #1a1a1a;text-align:center;">
              <p style="margin:0 0 4px;color:#3f3f46;font-size:12px;line-height:1.5;">
                Real-time conversations, built for modern communication
              </p>
              <p style="margin:0;color:#27272a;font-size:11px;">
                &copy; ${year} Synora. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
      htmlContent: buildOtpEmailHtml(otp, type),
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
