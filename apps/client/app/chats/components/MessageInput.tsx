"use client";

import { memo, useState } from "react";

interface MessageInputProps {
  chatId: string;
  connected: boolean;
  onSendMessage: (chatId: string, content: string) => void;
  onSendTyping: (chatId: string) => void;
}

function MessageInput({
  chatId,
  connected,
  onSendMessage,
  onSendTyping,
}: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(chatId, input);
    setInput("");
  };

  const handleTyping = () => {
    onSendTyping(chatId);
  };

  return (
    <div className="border-t border-border bg-surface/50 px-4 py-3">
      <div className="max-w-2xl mx-auto flex gap-2 items-end rounded-2xl bg-white/3 border border-border px-4 py-2 focus-within:border-emerald/30 transition-colors">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 text-sm text-white placeholder:text-dim/60 outline-none bg-transparent py-1"
        />
        <button
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          className="shrink-0 w-8 h-8 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 disabled:opacity-30 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export const MemoMessageInput = memo(MessageInput);
