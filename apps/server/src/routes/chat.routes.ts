import { Router } from "express";
import { prisma } from "../db";
import { getSessionFromHeaders } from "../lib/session";
const chatRoutes = Router();

chatRoutes.post("/", async (req, res) => {
  try {
    const session = await getSessionFromHeaders(req.headers);

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

    if (receiverId === session.user.id) {
      return res.status(400).json({
        message: "You cannot create a chat with yourself.",
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

chatRoutes.get("/", async (req, res) => {
  try {
    const session = await getSessionFromHeaders(req.headers);

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      isGroup: chat.isGroup,
      name: chat.name,
      members: chat.members,
      lastMessage: chat.messages[0] ?? null,
      updatedAt: chat.updatedAt,
    }));

    return res.json(formattedChats);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export { chatRoutes };
