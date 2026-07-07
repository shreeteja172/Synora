import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { type WsMessage, MessageType } from "@repo/types/ws";
import { handleMessage } from "./handlers/message";
import { authenticate } from "./auth";
import { prisma } from "../db";
import { manager, type AuthenticatedWebSocket } from "./manager";

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 100 });

  server.on("upgrade", (request, socket, head) => {
    authenticate(request)
      .then(async (sessionUser) => {
        if (!sessionUser) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        const profile = await prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: { name: true },
        });

        wss.handleUpgrade(request, socket, head, (ws) => {
          const client = ws as AuthenticatedWebSocket;
          client.userId = sessionUser.id;
          client.userName = profile?.name || "User";
          wss.emit("connection", client, request);
        });
      })
      .catch((err) => {
        console.error("[WS] Auth error:", err);
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
      });
  });

  wss.on("connection", (ws: AuthenticatedWebSocket) => {
    if (!ws.userId) return;

    manager.connect(ws.userId, ws, ws.userName || "User");

    ws.on("message", async (data) => {
      try {
        const message: WsMessage = JSON.parse(data.toString());

        const sender = {
          id: ws.userId!,
          name: ws.userName || "User",
        };

        switch (message.type) {
          case MessageType.MESSAGE: {
            const result = await handleMessage({
              senderId: ws.userId!,
              chatId: message.payload.chatId,
              content: message.payload.content,
            });

            for (const userId of result.memberIds) {
              manager.send(userId, {
                type: MessageType.NEW_MESSAGE,
                payload: result.message,
              });
            }

            break;
          }

          case MessageType.TYPING: {
            if (!message.payload?.chatId) break;
            const typingMembers = await prisma.chatMember.findMany({
              where: { chatId: message.payload.chatId },
              select: { userId: true },
            });
            for (const member of typingMembers) {
              if (member.userId !== ws.userId) {
                manager.send(member.userId, {
                  type: MessageType.TYPING,
                  payload: {
                    chatId: message.payload.chatId,
                    sender,
                  },
                });
              }
            }
            break;
          }

          case MessageType.SEEN: {
            if (!message.payload?.chatId) break;
            const seenMembers = await prisma.chatMember.findMany({
              where: { chatId: message.payload.chatId },
              select: { userId: true },
            });
            for (const member of seenMembers) {
              if (member.userId !== ws.userId) {
                manager.send(member.userId, {
                  type: MessageType.SEEN,
                  payload: {
                    chatId: message.payload.chatId,
                    sender,
                  },
                });
              }
            }
            break;
          }

          default:
            console.log("[WS] Unknown message type:", message.type);
        }
      } catch (err) {
        console.error("[WS] Invalid message:", err);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        manager.disconnect(ws.userId);
      }
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for ${ws.userId}:`, err);
    });
  });
};
