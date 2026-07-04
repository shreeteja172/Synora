import { prisma } from "../../db";

type HandleMessageParams = {
  senderId: string;
  chatId: string;
  content: string;
};
export async function handleMessage({
  senderId,
  chatId,
  content,
}: HandleMessageParams) {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      members: {
        some: {
          userId: senderId,
        },
      },
    },
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  const savedMessage = await prisma.message.create({
    data: {
      senderId,
      chatId,
      content,
    },
  });

  await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {},
  });

  const chatMembers = await prisma.chatMember.findMany({
    where: {
      chatId,
    },
    select: {
      userId: true,
    },
  });

  const memberIds = chatMembers.map((m) => m.userId);

  return {
    message: savedMessage,
    memberIds,
  };
}