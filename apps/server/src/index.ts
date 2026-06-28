import express, { Request, Response } from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { type WsMessage } from "@repo/types/ws";
import prisma from "./db";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

const wss = new WebSocketServer({ server, noServer: true });


const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.SERVER_URL}/auth/google/callback`
);

app.get("/auth/google", (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
  res.json({ authUrl });
});

app.get("/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    const userInfo = await google.oauth2("v2").userinfo.get({ auth: oauth2Client });
    const { email, name, picture, id: googleId } = userInfo.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name, image: picture, googleId },
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

    res.redirect(`${process.env.CLIENT_URL}?token=${token}&userId=${user.id}`);
  } catch (error) {
    console.error("OAuth error:", error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

//websocket

wss.on("connection", (ws: AuthenticatedWebSocket) => {
  console.log(`User ${ws.userId} connected`);

  ws.on("message", (data) => {
    try {
      const message: WsMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "MESSAGE":
          console.log(
            `[MESSAGE] userId: ${ws.userId}, chatId: ${message.payload.chatId}, content: ${message.payload.content}`
          );
          break;
        case "TYPING":
          console.log(`[TYPING] userId: ${ws.userId}`);
          break;
        case "SEEN":
          console.log(`[SEEN] userId: ${ws.userId}`);
          break;
        default:
          console.log("[UNKNOWN]", message);
      }

      wss.clients.forEach((client: AuthenticatedWebSocket) => {
        if (client !== ws && client.readyState === 1) {
          client.send(data.toString());
        }
      });
    } catch (error) {
      console.log("Invalid message format:", data.toString());
    }
  });

  ws.on("close", () => {
    console.log(`User ${ws.userId} disconnected`);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for user ${ws.userId}:`, error);
  });
});

app.get("/", (req, res) => {
  // const 
  res.send("Server running");
});