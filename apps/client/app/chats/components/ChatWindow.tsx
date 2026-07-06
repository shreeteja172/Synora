"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "@/lib/auth-client";
import type { Chat, Message } from "../types";
import { MessageInput } from "./MessageInput";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

async function fetchMessages(chatId: string): Promise<Message[]> {
  const { data } = await api.get<Message[]>(`/api/chats/${chatId}/messages`);
  return data.reverse();
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ChatWindowProps {
  chat: Chat | undefined;
  connected: boolean;
  typingText: string;
  onSendMessage: (chatId: string, content: string) => void;
  onSendTyping: (chatId: string) => void;
  onBack: () => void;
}

export function ChatWindow({
  chat,
  connected,
  typingText,
  onSendMessage,
  onSendTyping,
  onBack,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const chatId = chat?.id ?? null;

  const otherMember = chat?.members.find(
    (m) => m.user.id !== session?.user?.id,
  );

  const messagesQuery = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => fetchMessages(chatId!),
    enabled: !!chatId,
  });

  const messages = messagesQuery.data ?? [];

  if (!chat || !otherMember) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-emerald"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <p className="text-sm text-dim">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/50">
        <button
          onClick={onBack}
          className="md:hidden text-dim hover:text-white mr-1"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {otherMember.user.image ? (
          <Image
            src={otherMember.user.image}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-emerald/10 text-emerald text-[11px] font-semibold flex items-center justify-center">
            {getInitials(otherMember.user.name || "U")}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-white">
            {otherMember.user.name || otherMember.user.username}
          </p>
          <p className="text-[10px] text-emerald">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-1">
          {messagesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === session?.user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className={`text-sm px-3.5 py-2 rounded-2xl ${
                        isOwn
                          ? "bg-emerald/10 text-white border border-emerald/10 rounded-br-md"
                          : "bg-white/3 text-white border border-border rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p
                      className={`text-[10px] text-dim mt-0.5 ${
                        isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          {typingText && (
            <div className="flex items-center gap-1.5 px-1 py-1">
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-1" />
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-2" />
                <span className="w-1 h-1 rounded-full bg-dim typing-dot-3" />
              </div>
              <span className="text-[10px] text-dim">{typingText}</span>
            </div>
          )}
        </div>
      </div>

      <MessageInput
        chatId={chat.id}
        connected={connected}
        onSendMessage={onSendMessage}
        onSendTyping={onSendTyping}
      />
    </div>
  );
}
