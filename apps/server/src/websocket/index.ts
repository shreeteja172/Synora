import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { type WsMessage, MessageType } from "@repo/types/ws";
import { handleMessage } from "./handlers/message";
import { authenticate } from "./auth";
import { prisma } from "../db";
import { manager, type AuthenticatedWebSocket } from "./manager";
import { schemas } from "../lib/validate";

async function getChatPartnerIds(userId: string): Promise<string[]> {
  const partners = await prisma.chatMember.findMany({
    where: {
      chat: { members: { some: { userId } } },
      userId: { not: userId },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  return partners.map((p) => p.userId);
}

async function broadcastPresence(userId: string, online: boolean) {
  const partnerIds = await getChatPartnerIds(userId);
  for (const partnerId of partnerIds) {
    manager.send(partnerId, {
      type: MessageType.PRESENCE,
      payload: { userId, online },
    });
  }
}

async function sendInitialPresence(userId: string) {
  const partnerIds = await getChatPartnerIds(userId);
  for (const partnerId of partnerIds) {
    if (manager.isOnline(partnerId)) {
      manager.send(userId, {
        type: MessageType.PRESENCE,
        payload: { userId: partnerId, online: true },
      });
    }
  }
}

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });

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

    void sendInitialPresence(ws.userId).catch((err) =>
      console.error("[WS] Initial presence error:", err),
    );
    void broadcastPresence(ws.userId, true).catch((err) =>
      console.error("[WS] Presence broadcast error:", err),
    );

    ws.on("message", async (data) => {
      try {
        const parsed = JSON.parse(data.toString());

        const validation = schemas.wsMessage.safeParse(parsed);
        if (!validation.success) {
          console.error("[WS] Invalid message format:", validation.error.flatten());
          return;
        }

        const message = validation.data;

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
              clientMessageId: message.payload.clientMessageId,
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

        }
      } catch (err) {
        console.error("[WS] Invalid message:", err);
      }
    });

    ws.on("close", () => {
      if (ws.userId) {
        manager.disconnect(ws.userId);
        void broadcastPresence(ws.userId, false).catch((err) =>
          console.error("[WS] Presence broadcast error:", err),
        );
      }
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error for ${ws.userId}:`, err);
    });
  });
};
