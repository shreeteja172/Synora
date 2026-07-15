"use client";

import { memo, useState, useRef } from "react";
import { generateReactHelpers } from "@uploadthing/react";

const { useUploadThing } = generateReactHelpers({
  url: `${process.env.NEXT_PUBLIC_API_URL}/api/uploadthing`,
  fetch: (input, init) => {
    if (input.toString().includes("localhost:4000")) {
      return fetch(input, {
        ...init,
        credentials: "include",
      });
    }
    return fetch(input, init);
  },
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("chatAttachment", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        onSendMessage(chatId, `[IMAGE]${res[0].url}`);
      }
    },
    onUploadError: (e) => {
      console.error(e);
      alert("Upload failed");
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(chatId, input);
    setInput("");
  };

  const handleTyping = () => {
    onSendTyping(chatId);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await startUpload([file]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#121212]">
      <div className="max-w-3xl mx-auto flex gap-3 items-center">
        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-[#2c2c2e] px-3.5 py-2.5 focus-within:ring-1 focus-within:ring-[#26A69A]/40 transition-shadow">
          <button
            type="button"
            className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors shrink-0"
            aria-label="Emoji"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008H14.25V9.75z"
              />
            </svg>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Write your message..."
            className="flex-1 text-sm text-[#f5f5f5] placeholder:text-[#a0a0a0] outline-none bg-transparent py-1"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors shrink-0 disabled:opacity-50"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !connected}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-[#a0a0a0] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          className="shrink-0 w-11 h-11 rounded-xl bg-[#26A69A] text-white flex items-center justify-center hover:bg-[#2bbbad] disabled:opacity-30 transition-colors"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
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
