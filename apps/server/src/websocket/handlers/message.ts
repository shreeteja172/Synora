import { prisma } from "../../db";

type HandleMessageParams = {
  senderId: string;
  chatId: string;
  content: string;
  clientMessageId?: string;
};

export async function handleMessage({
  senderId,
  chatId,
  content,
  clientMessageId,
}: HandleMessageParams) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      members: { some: { userId: senderId } },
    },
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  const savedMessage = await prisma.message.create({
    data: { senderId, chatId, content },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {},
  });

  const chatMembers = await prisma.chatMember.findMany({
    where: { chatId },
    select: { userId: true },
  });

  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { id: true, name: true, image: true },
  });

  return {
    message: {
      id: savedMessage.id,
      chatId: savedMessage.chatId,
      content: savedMessage.content,
      senderId: savedMessage.senderId,
      createdAt: savedMessage.createdAt.toISOString(),
      clientMessageId,
      sender: sender
        ? { id: sender.id, name: sender.name || "User", image: sender.image }
        : { id: senderId, name: "User" },
    },
    memberIds: chatMembers.map((m) => m.userId),
  };
}
