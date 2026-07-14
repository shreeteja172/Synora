import type { Message } from "../types";

export function mergeMessagesById(
  fetched: Message[],
  cached: Message[],
): Message[] {
  const byId = new Map<string, Message>();
  for (const message of fetched) {
    byId.set(message.id, message);
  }
  for (const message of cached) {
    if (!byId.has(message.id)) {
      byId.set(message.id, message);
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function appendMessageToPages(
  pages: Message[][],
  message: Message,
  clientMessageId?: string,
): Message[][] {
  if (pages.length === 0) {
    return [[message]];
  }

  const replaced = pages.map((page) =>
    page.map((existing) =>
      clientMessageId && existing.id === clientMessageId
        ? message
        : existing,
    ),
  );

  const alreadyPresent = replaced.some((page) =>
    page.some((existing) => existing.id === message.id),
  );
  if (alreadyPresent) {
    return replaced;
  }

  const lastPageIndex = replaced.length - 1;
  return replaced.map((page, index) =>
    index === lastPageIndex ? [...page, message] : page,
  );
}

export function shouldCreateMessagesCache(hasCache: boolean): boolean {
  return !hasCache;
}

/** @deprecated kept for older call sites — always append when handling NEW_MESSAGE */
export function messagesCacheActionForIncoming(
  messageChatId: string,
  activeChatId: string | null,
): "append" | "invalidate" {
  return messageChatId === activeChatId ? "append" : "invalidate";
}
