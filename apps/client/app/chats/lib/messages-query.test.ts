import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import {
  MESSAGES_STALE_TIME_MS,
  getMessagesInfiniteQueryOptions,
  messagesQueryKey,
  prefetchChatMessages,
} from "./messages-query.ts";

test("messages query key is stable for a chat id", () => {
  assert.deepEqual(messagesQueryKey("chat-1"), ["messages", "chat-1"]);
});

test("messages query keeps data fresh long enough to reopen instantly", () => {
  const options = getMessagesInfiniteQueryOptions("chat-1");
  assert.ok(
    (options.staleTime ?? 0) >= 30_000,
    "staleTime should cache first page across rapid chat switches",
  );
  assert.equal(MESSAGES_STALE_TIME_MS >= 30_000, true);
});

test("prefetchChatMessages warms the infinite cache before ChatWindow mounts", async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const page = [
    {
      id: "m1",
      content: "hello",
      chatId: "chat-1",
      senderId: "u1",
      createdAt: "2026-07-14T10:00:00.000Z",
    },
  ];

  let fetchCalls = 0;
  const fetchPage = async () => {
    fetchCalls += 1;
    return page;
  };

  await prefetchChatMessages(queryClient, "chat-1", fetchPage);

  const cached = queryClient.getQueryData(messagesQueryKey("chat-1")) as
    | { pages: unknown[] }
    | undefined;

  assert.equal(fetchCalls, 1);
  assert.ok(cached, "prefetch must populate react-query cache");
  assert.deepEqual(cached.pages, [page]);

  // Second open should hit cache (same stale window), not refetch
  await prefetchChatMessages(queryClient, "chat-1", fetchPage);
  assert.equal(fetchCalls, 1);

  queryClient.clear();
});
