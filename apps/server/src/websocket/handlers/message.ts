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
  const savedMessage = await prisma.message.create({
    data: {
      senderId,
      chatId,
      content,
    },
  });

  console.log(savedMessage);
}