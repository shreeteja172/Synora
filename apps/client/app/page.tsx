"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (e) => {
      setMessages((prev) => [...prev, e.data]);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return;
    wsRef.current.send(input);
    setMessages((prev) => [...prev, `You: ${input}`]);
    setInput("");
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
            {messages.map((msg, i) => (
              <div
                key={i}
                className="text-sm text-zinc-800 dark:text-zinc-200"
              >
                {msg}
              </div>
            ))}
          </div>

          <div className="flex border-t border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
