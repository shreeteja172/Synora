"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageType, type WsMessage } from "@repo/types/ws";

interface DisplayMessage {
  id: number;
  text: string;
  type: MessageType;
}

export default function Home() {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addMessage = useCallback((text: string, type: MessageType) => {
    setMessages((prev) => [...prev, { id: idRef.current++, text, type }]);
  }, []);

  const connect = useCallback(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      try {
        const msg: WsMessage = JSON.parse(e.data);
        switch (msg.type) {
          case MessageType.MESSAGE:
            addMessage(msg.payload.content, MessageType.MESSAGE);
            break;
          case MessageType.TYPING:
            setIsTyping(true);
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(
              () => setIsTyping(false),
              2000,
            );
            break;
          case MessageType.SEEN:
            addMessage("Seen", MessageType.SEEN);
            break;
        }
      } catch {
        addMessage(e.data, MessageType.MESSAGE);
      }
    };

    wsRef.current = ws;
  }, [addMessage, wsUrl]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [connect]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;

    const msg: WsMessage = {
      type: MessageType.MESSAGE,
      payload: { chatId: "1", content: input },
    };

    wsRef.current.send(JSON.stringify(msg));
    addMessage(input, MessageType.MESSAGE);
    setInput("");
  };

  const handleTyping = () => {
    if (!wsRef.current) return;
    const msg: WsMessage = { type: MessageType.TYPING };
    wsRef.current.send(JSON.stringify(msg));
  };

  const handleSeen = () => {
    if (!wsRef.current) return;
    const msg: WsMessage = { type: MessageType.SEEN };
    wsRef.current.send(JSON.stringify(msg));
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-2xl flex-col py-16 px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50 mb-2">
          Synora
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          {connected ? "Connected" : "Disconnected"}
          <span
            className={`inline-block w-2 h-2 rounded-full ml-2 ${connected ? "bg-green-500" : "bg-red-500"}`}
          />
        </p>

        <div className="flex flex-col flex-1 min-h-100 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white dark:bg-zinc-950">
            {messages.length === 0 && (
              <p className="text-zinc-400 text-sm">No messages yet.</p>
            )}
            {isTyping && (
              <p className="text-xs text-zinc-400 italic">
                Someone is typing...
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.type === MessageType.SEEN
                    ? "text-xs text-zinc-400 italic"
                    : "text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onFocus={handleSeen}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!connected}
              className="px-6 text-sm font-medium bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
