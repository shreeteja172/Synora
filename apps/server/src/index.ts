import express, { Request, Response } from "express";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { type WsMessage } from "@repo/types/ws";
import { prisma } from "./db";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./routes/auth";
import "./config/env";
import { otpRoutes } from "./routes/otp.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use("/api/otp", otpRoutes);

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


// console.log({
//   BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
// });

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

const wss = new WebSocketServer({ server });

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
