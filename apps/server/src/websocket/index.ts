import { Server } from "http";
import { WebSocketServer } from "ws";
import { type WsMessage } from "@repo/types/ws";
import { handleMessage } from "./handlers/message";
import { authenticate } from "./auth";
import { manager, type AuthenticatedWebSocket } from "./manager";

export const initWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: AuthenticatedWebSocket, request) => {
    try {
      const user = await authenticate(request);

      if (!user) {
        console.log("Unauthenticated websocket connection");
        ws.close();
        return;
      }

      manager.connect(user.id, ws);

      console.log(`User ${user.id} connected`);

      ws.on("message", async (data) => {
        try {
          const message: WsMessage = JSON.parse(data.toString());

          switch (message.type) {
            case "MESSAGE": {
              const result = await handleMessage({
                senderId: ws.userId!,
                chatId: message.payload.chatId,
                content: message.payload.content,
              });

              for (const userId of result.memberIds) {
                manager.send(userId, {
                  type: "NEW_MESSAGE",
                  payload: result.message,
                });
              }

              break;
            }
            case "TYPING":
              console.log(`[TYPING] userId: ${ws.userId}`);
              break;

            case "SEEN":
              console.log(`[SEEN] userId: ${ws.userId}`);
              break;

            default:
              console.log("[UNKNOWN]", message);
          }
        } catch (err) {
          console.error("Invalid websocket message", err);
        }
      });

      ws.on("close", () => {
        if (ws.userId) {
          manager.disconnect(ws.userId);
        }
      });

      ws.on("error", (err) => {
        console.error(err);
      });
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
};
