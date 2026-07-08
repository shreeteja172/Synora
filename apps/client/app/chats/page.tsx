"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession, signOut } from "@/lib/auth-client";
import type { Chat } from "./types";
import { useWebSocket } from "./hooks/useWebSocket";
import { MemoChatList } from "./components/MemoChatList";
import { ChatWindow } from "./components/ChatWindow";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

async function fetchChats(): Promise<Chat[]> {
  const { data } = await api.get<Chat[]>("/api/chats");
  return data;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ChatPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!session,
  });

  const { connected, sendMessage, sendTyping, typingText } = useWebSocket({
    activeChatId,
  });

  const activeChat = chatsQuery.data?.find((c) => c.id === activeChatId);

  useEffect(() => {
    if (!sessionLoading && !session) router.push("/auth/signin");
  }, [session, sessionLoading, router]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileShowChat(true);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-dim text-sm">
          <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-emerald"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Synora
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-emerald" : "bg-rose-400"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/3 border border-border">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-emerald/10 text-emerald text-[8px] font-semibold flex items-center justify-center">
                  {getInitials(session.user.name || session.user.email)}
                </div>
              )}
              <span className="text-[11px] text-white font-medium">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="text-[10px] text-dim hover:text-white transition-colors px-1.5 py-1 rounded hover:bg-white/3"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <MemoChatList
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          mobileShowChat={mobileShowChat}
        />

        <main
          className={`${
            !mobileShowChat ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-background`}
        >
          <ChatWindow
            chat={activeChat}
            connected={connected}
            typingText={typingText}
            onSendMessage={sendMessage}
            onSendTyping={sendTyping}
            onBack={() => setMobileShowChat(false)}
          />
        </main>
      </div>
    </div>
  );
}
