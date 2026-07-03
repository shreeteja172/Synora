import { Router } from "express";

export const chatRoutes = Router();

chatRoutes.post("/", async (req, res) => {
  res.json({
    message: "Create chat route",
  });
});