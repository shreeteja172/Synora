import express, { Request, Response } from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import prisma from "../db";
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.SERVER_URL}/auth/google/callback`
);

router.get("/google", (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
  res.json({ authUrl });
});

router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const userInfo = await google.oauth2("v2").userinfo.get({ auth: oauth2Client });
    const { email, name, picture, id: googleId } = userInfo.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture,
          googleId,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.CLIENT_URL}?token=${token}&userId=${user.id}`
    );
  } catch (error) {
    console.error("OAuth error:", error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

export default router;