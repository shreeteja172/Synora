import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { type WsMessage } from "@repo/types/ws";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: AuthenticatedWebSocket) => {
    console.log(`User ${ws.userId} connected`);

    ws.on("message", (data) => {
      try {
        const message: WsMessage = JSON.parse(data.toString());

        switch (message.type) {
          case "MESSAGE":
            console.log(
              `[MESSAGE] userId: ${ws.userId}, chatId: ${message.payload.chatId}, content: ${message.payload.content}`,
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
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(data.toString());
          }
        });
      } catch {
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
};
