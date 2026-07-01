import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./routes/auth";
import "./config/env";
import { otpRoutes } from "./routes/otp.routes";
import { initWebSocket } from "./websocket/index";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.all("/api/auth/*splat", toNodeHandler(auth));
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

initWebSocket(server);
