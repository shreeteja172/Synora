import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./routes/auth";
import "./config/env";
import { otpRoutes } from "./routes/otp.routes";
import { initWebSocket } from "./websocket/index";
import { chatRoutes } from "./routes/chat.routes";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use((req, _res, next) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const decoded = cookieHeader
      .split(";")
      .map((c) => {
        const [name, ...rest] = c.split("=");
        const value = rest.join("=");
        if (name.trim() === "better-auth.session_token") {
          return `${name}=${decodeURIComponent(value)}`;
        }
        return c;
      })
      .join(";");
    req.headers.cookie = decoded;
  }
  next();
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/otp", otpRoutes);
app.use("/api/chats", chatRoutes);
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// console.log({
//   BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
//   GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
//   GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
// });

initWebSocket(server);
