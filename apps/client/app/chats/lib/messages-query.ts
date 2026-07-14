import { infiniteQueryOptions, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import type { Message } from "../types";
import { mergeMessagesById } from "./messages-live";

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
  return infiniteQueryOptions({
    queryKey: messagesQueryKey(chatId ?? ""),
    queryFn: async ({
      pageParam,
      client,
      queryKey,
    }) => {
      const fetched = await fetchMessages({
        chatId: chatId!,
        before: pageParam as string | undefined,
      });

      // First page only: keep any live WS messages that arrived during the fetch.
      if (pageParam) {
        return fetched;
      }

      const existing = client.getQueryData(queryKey) as
        | InfiniteData<Message[]>
        | undefined;
      const cached = existing?.pages?.flat() ?? [];
      if (cached.length === 0) {
        return fetched;
      }
      return mergeMessagesById(fetched, cached);
    },
    enabled: !!chatId,
    staleTime: MESSAGES_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    getPreviousPageParam: (firstPage: Message[]) => {
      if (firstPage.length < PAGE_SIZE) return undefined;
      return firstPage[0]?.createdAt;
    },
  });
}

export async function prefetchChatMessages(
  queryClient: QueryClient,
  chatId: string,
  fetchPage?: () => Promise<Message[]>,
) {
  const key = messagesQueryKey(chatId);
  const state = queryClient.getQueryState(key);
  if (state?.data || state?.fetchStatus === "fetching") {
    return;
  }

  const baseOptions = getMessagesInfiniteQueryOptions(chatId);

  await queryClient.prefetchInfiniteQuery({
    ...baseOptions,
    queryFn: fetchPage ?? baseOptions.queryFn,
  } as typeof baseOptions & {
    queryFn: () => Promise<Message[]>;
    initialPageParam: string | undefined;
  });
}
