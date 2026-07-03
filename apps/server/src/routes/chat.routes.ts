import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";
import { prisma } from "../db";
const chatRoutes = Router();

chatRoutes.post("/", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { receiverId } = req.body;
    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }
    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          {
            members: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            members: {
              some: {
                userId: receiverId,
              },
            },
          },
        ],
      },
    });
    if (existingChat) {
      return res.json(existingChat);
    }

    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        members: {
          create: [
            {
              userId: session.user.id,
            },
            {
              userId: receiverId,
            },
          ],
        },
      },
      include: {
        members: true,
      },
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export { chatRoutes };
