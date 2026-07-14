import type { Chat } from "../types";

/**
 * Resolve the active chat for the window.
 * Prefers the chats cache; falls back to a pending (just-created) chat
 * so the window can open before an async refetch finishes.
 */
export function resolveActiveChat(
  chats: Chat[] | undefined,
  activeChatId: string | null,
  pendingChat: Chat | null | undefined,
): Chat | undefined {
  if (!activeChatId) return undefined;
  const fromCache = chats?.find((chat) => chat.id === activeChatId);
  if (fromCache) return fromCache;
  if (pendingChat?.id === activeChatId) return pendingChat;
  return undefined;
}

/**
 * Upsert a chat into the list (prepend if new).
 */
export function upsertChatInList(
  chats: Chat[] | undefined,
  chat: Chat,
): Chat[] {
  const list = chats ?? [];
  const existingIndex = list.findIndex((c) => c.id === chat.id);
  if (existingIndex === -1) {
    return [chat, ...list];
  }
  const next = [...list];
  next[existingIndex] = chat;
  return next;
}
