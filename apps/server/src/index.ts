import express from "express";
import { WebSocketServer } from "ws";

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
    console.log(data.toString());
  });
});