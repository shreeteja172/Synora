import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageType, type WsMessage } from "@repo/types/ws";
import { useSession } from "@/lib/auth-client";
import type { Message } from "../types";

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

  const [connected, setConnected] = useState(false);
  const [typingSenders, setTypingSenders] = useState<Map<string, TypingSender>>(
    new Map(),
  );

  const clearTypingThrottle = useCallback(() => {
    if (typingThrottleRef.current) {
      clearTimeout(typingThrottleRef.current);
      typingThrottleRef.current = null;
    }
  }, []);
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (!session) return;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
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
              qc.setQueryData<Message[]>(
                ["messages", activeChatIdRef.current],
                (old) => {
                  if (!old) return old;
                  if (old.some((m) => m.id === p.id)) return old;
                  return [
                    ...old,
                    {
                      id: p.id,
                      content: p.content,
                      chatId: p.chatId,
                      senderId: p.senderId,
                      createdAt: p.createdAt,
                    },
                  ];
                },
              );
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
        }
      } catch {}
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      clearTypingThrottle();
    };
  }, [session, wsUrl, qc, clearTypingThrottle]);

  const sendMessage = useCallback((chatId: string, content: string) => {
    if (!wsRef.current || !content.trim()) return;
    wsRef.current.send(
      JSON.stringify({
        type: MessageType.MESSAGE,
        payload: { chatId, content },
      }),
    );
  }, []);

  const sendTyping = useCallback(
    (chatId: string) => {
      if (!wsRef.current || !chatId || typingThrottleRef.current) return;
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
  };
}
