export function clearUnreadForChat<
  T extends { id: string; unreadCount: number },
>(chats: T[], chatId: string): T[] {
  return chats.map((chat) =>
    chat.id === chatId ? { ...chat, unreadCount: 0 } : chat,
  );
}

export function nextUnreadCountOnIncoming(args: {
  currentUnread: number;
  senderId: string;
  currentUserId: string;
  chatId: string;
  activeChatId: string | null;
}): number {
  if (args.senderId === args.currentUserId) return args.currentUnread;
  if (args.chatId === args.activeChatId) return args.currentUnread;
  return args.currentUnread + 1;
}

export function formatUnreadBadge(count: number): string | null {
  if (count <= 0) return null;
  if (count > 9) return "9+";
  return String(count);
}
