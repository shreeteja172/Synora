import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageType, type WsMessage } from "@repo/types/ws";
import { useSession } from "@/lib/auth-client";
import type { Chat, Message } from "../types";

interface UseWebSocketOptions {
  activeChatId: string | null;
}

interface TypingSender {
  name: string;
  timeout: ReturnType<typeof setTimeout>;
}

export function useWebSocket({ activeChatId }: UseWebSocketOptions) {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

  const wsRef = useRef<WebSocket | null>(null);
  const typingThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);

  const [connected, setConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [typingSenders, setTypingSenders] = useState<Map<string, TypingSender>>(
    new Map(),
  );

  const clearTypingThrottle = useCallback(() => {
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
      typingThrottleRef.current = null;
    }
  }, []);
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  const activeChatIdRef = useRef<string | null>(null);

  const updateInfiniteMessagesCache = useCallback(
    (chatId: string, updater: (pages: Message[][]) => Message[][]) => {
      qc.setQueryData(
        ["messages", chatId],
        (old: { pages?: Message[][]; pageParams?: unknown[] } | undefined) => {
          if (!old) return old;

          return {
            pages: updater(old?.pages ?? []),
            pageParams: old?.pageParams ?? [],
          };
        },
      );
    },
    [qc],
  );

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (!session) return;

    const connect = () => {
      clearReconnectTimeout();

      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const sessionToken = session.session?.token;
      if (!sessionToken) return;

      const wsEndpoint = new URL(wsUrl);
      wsEndpoint.searchParams.set("token", sessionToken);
      const ws = new WebSocket(wsEndpoint.toString());

      shouldReconnectRef.current = true;
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setConnected(true);
        setOnlineUserIds(new Set());
      };

      ws.onclose = () => {
        setConnected(false);

        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        if (!shouldReconnectRef.current) {
          return;
        }

        const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 10000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setConnected(false);
      };

      ws.onmessage = (e) => {
        try {
          const msg: WsMessage = JSON.parse(e.data);

          switch (msg.type) {
            case MessageType.NEW_MESSAGE: {
              const p = msg.payload;
              if (p.chatId === activeChatIdRef.current) {
                updateInfiniteMessagesCache(p.chatId, (pages) => {
                  const updatedPages = pages.map((page) =>
                    page.map((message) =>
                      message.id === p.clientMessageId
                        ? {
                            id: p.id,
                            content: p.content,
                            chatId: p.chatId,
                            senderId: p.senderId,
                            createdAt: p.createdAt,
                          }
                        : message,
                    ),
                  );

                  const alreadyPresent = updatedPages.some((page) =>
                    page.some((message) => message.id === p.id),
                  );

                  if (alreadyPresent) {
                    return updatedPages;
                  }

                  if (updatedPages.length === 0) {
                    return [
                      [
                        {
                          id: p.id,
                          content: p.content,
                          chatId: p.chatId,
                          senderId: p.senderId,
                          createdAt: p.createdAt,
                        },
                      ],
                    ];
                  }

                  const lastPageIndex = updatedPages.length - 1;
                  return updatedPages.map((page, index) =>
                    index === lastPageIndex
                      ? [
                          ...page,
                          {
                            id: p.id,
                            content: p.content,
                            chatId: p.chatId,
                            senderId: p.senderId,
                            createdAt: p.createdAt,
                          },
                        ]
                      : page,
                  );
                });
              }
              qc.invalidateQueries({ queryKey: ["chats"] });
              break;
            }

            case MessageType.MESSAGE: {
              qc.invalidateQueries({
                queryKey: ["messages", msg.payload.chatId],
              });
              qc.invalidateQueries({ queryKey: ["chats"] });
              break;
            }

            case MessageType.TYPING: {
              if (msg.payload.sender.id === session?.user?.id) break;
              if (msg.payload.chatId !== activeChatIdRef.current) break;
              const senderId = msg.payload.sender.id;
              setTypingSenders((prev) => {
                const next = new Map(prev);
                const existing = next.get(senderId);
                if (existing) clearTimeout(existing.timeout);
                const timeout = setTimeout(() => {
                  setTypingSenders((p) => {
                    const n = new Map(p);
                    n.delete(senderId);
                    return n;
                  });
                }, 2000);
                next.set(senderId, { name: msg.payload.sender.name, timeout });
                return next;
              });
              break;
            }

            case MessageType.PRESENCE: {
              const { userId, online } = msg.payload;
              setOnlineUserIds((prev) => {
                const next = new Set(prev);
                if (online) next.add(userId);
                else next.delete(userId);
                return next;
              });
              break;
            }
          }
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
        }
      };
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }
    };

    connect();
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimeout();
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
      wsRef.current?.close();
      clearTypingThrottle();
    };
  }, [
    session,
    wsUrl,
    qc,
    clearTypingThrottle,
    clearReconnectTimeout,
    updateInfiniteMessagesCache,
  ]);

  const sendMessage = useCallback(
    (chatId: string, content: string) => {
      if (
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN ||
        !content.trim()
      )
        return;

      const clientMessageId = crypto.randomUUID();
      const optimisticMessage: Message = {
        id: clientMessageId,
        content,
        chatId,
        senderId: session?.user?.id || "",
        createdAt: new Date().toISOString(),
      };

      updateInfiniteMessagesCache(chatId, (pages) => {
        if (pages.length === 0) {
          return [[optimisticMessage]];
        }

        const lastPageIndex = pages.length - 1;
        return pages.map((page, index) =>
          index === lastPageIndex ? [...page, optimisticMessage] : page,
        );
      });

      qc.setQueryData<Chat[]>(["chats"], (old) => {
        if (!old) return old;

        return old.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: {
                  id: clientMessageId,
                  content,
                  senderId: session?.user?.id || "",
                  createdAt: optimisticMessage.createdAt,
                },
              }
            : chat,
        );
      });

      wsRef.current.send(
        JSON.stringify({
          type: MessageType.MESSAGE,
          payload: { chatId, content, clientMessageId },
        }),
      );
    },
    [qc, session, updateInfiniteMessagesCache],
  );

  const sendTyping = useCallback(
    (chatId: string) => {
      if (
        !wsRef.current ||
        wsRef.current.readyState !== WebSocket.OPEN ||
        !chatId ||
        typingThrottleRef.current
      )
        return;
      wsRef.current.send(
        JSON.stringify({
          type: MessageType.TYPING,
          payload: {
            chatId,
            sender: {
              id: session?.user?.id || "",
              name: session?.user?.name || "",
            },
          },
        }),
      );
      typingThrottleRef.current = setTimeout(() => {
        typingThrottleRef.current = null;
      }, 1000);
    },
    [session],
  );

  const typingNames = Array.from(typingSenders.values()).map((s) => s.name);
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length === 2
        ? `${typingNames[0]} and ${typingNames[1]} are typing`
        : typingNames.length > 2
          ? "Several people are typing"
          : "";

  return {
    connected,
    sendMessage,
    sendTyping,
    typingText,
    onlineUserIds,
  };
}
