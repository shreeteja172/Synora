import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./routes/auth";
import "./config/env";
import { otpRoutes } from "./routes/otp.routes";
import { initWebSocket } from "./websocket/index";
import { chatRoutes } from "./routes/chat.routes";
import { prisma } from "./db";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use((req, _res, next) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    try {
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
    } catch {
      next();
      return;
    }
  }
  next();
});

const otpRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { message: "Too many OTP requests. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || "unknown",
});

const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { message: "Too many verification attempts. Request a new OTP." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.body?.email || "unknown",
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", timestamp: new Date().toISOString() });
  }
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/otp", otpRoutes);
app.use("/api/chats", apiLimiter, chatRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[API] Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

initWebSocket(server);
