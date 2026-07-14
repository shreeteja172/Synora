export function messageIsUnreadForUser(
  message: { senderId: string; createdAt: Date },
  userId: string,
  lastReadAt: Date | null,
): boolean {
  if (message.senderId === userId) return false;
  if (!lastReadAt) return true;
  return message.createdAt > lastReadAt;
}

export function countUnreadMessages(
  messages: { senderId: string; createdAt: Date }[],
  userId: string,
  lastReadAt: Date | null,
): number {
  return messages.filter((m) => messageIsUnreadForUser(m, userId, lastReadAt))
    .length;
}

export function unreadMessagesWhere(
  chatId: string,
  userId: string,
  lastReadAt: Date | null,
) {
  return {
    chatId,
    senderId: { not: userId },
    ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
  };
}
