import type { QueryClient } from "@tanstack/react-query";
import type { Message } from "../types";

export const PAGE_SIZE = 30;
export const MESSAGES_STALE_TIME_MS = 60_000;

export function messagesQueryKey(chatId: string) {
  return ["messages", chatId] as const;
}

async function fetchMessages({
  chatId,
  before,
}: {
  chatId: string;
  before?: string;
}): Promise<Message[]> {
  const { api } = await import("@/lib/api");
  const { data } = await api.get<Message[]>(`/api/chats/${chatId}/messages`, {
    params: {
      limit: PAGE_SIZE,
      ...(before ? { before } : {}),
    },
  });
  return data.reverse();
}

export function getMessagesInfiniteQueryOptions(chatId: string | null) {
  return {
    queryKey: messagesQueryKey(chatId ?? ""),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      fetchMessages({
        chatId: chatId!,
        before: pageParam,
      }),
    enabled: !!chatId,
    staleTime: MESSAGES_STALE_TIME_MS,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage: Message[]) => {
      if (firstPage.length < PAGE_SIZE) return undefined;
      return firstPage[0]?.createdAt;
    },
  };
}

export async function prefetchChatMessages(
  queryClient: QueryClient,
  chatId: string,
  fetchPage?: () => Promise<Message[]>,
) {
  const baseOptions = getMessagesInfiniteQueryOptions(chatId);

  await queryClient.prefetchInfiniteQuery({
    ...baseOptions,
    queryFn: fetchPage ?? baseOptions.queryFn,
  } as typeof baseOptions & {
    queryFn: () => Promise<Message[]>;
    initialPageParam: string | undefined;
  });
}
