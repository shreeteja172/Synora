import express from "express";
import { WebSocketServer } from "ws";
import { type WsMessage } from "@repo/types/ws";

const app = express();

const server = app.listen(4000, () => {
  console.log("Server running");
});

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (ws) => {
  console.log("Client Connected");

  ws.on("message", (data) => {
    try {
      const message: WsMessage = JSON.parse(data.toString());

      switch (message.type) {
        case "MESSAGE":
          console.log(
            `[MESSAGE] chatId: ${message.payload.chatId}, content: ${message.payload.content}`,
          );
          break;
        case "TYPING":
          console.log("[TYPING]");
          break;
        case "SEEN":
          console.log("[SEEN]");
          break;
        default:
          console.log("[UNKNOWN]", message);
      }

      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(data.toString());
        }
      });
    } catch {
      console.log("Invalid message format:", data.toString());
    }
  });
});
