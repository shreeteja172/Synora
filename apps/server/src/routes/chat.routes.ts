import { Router } from "express";
import { prisma } from "../db";
import { getSessionFromHeaders } from "../lib/session";
const chatRoutes = Router();

chatRoutes.get("/users/search", async (req, res) => {
  try {
    const session = await getSessionFromHeaders(req.headers);
    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const q = (req.query.q as string) || "";
    if (!q || q.length < 1) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
      },
      take: 10,
    });

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

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

//yeh wala route user ke chats ko fetch karega, aur har chat ke last message ko bhi fetch karega.
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

//yeh wala route seperate chat ke messages ko fetch karega, aur sirf wo user ke liye accessible hoga jo us chat ka member hai.
chatRoutes.get("/:chatId/messages", async (req, res) => {
  try {
    const session = await getSessionFromHeaders(req.headers);

    if (!session) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { chatId } = req.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }
    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    });
    return res.json(messages);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export { chatRoutes };
