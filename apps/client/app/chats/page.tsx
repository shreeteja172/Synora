"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import type { Chat } from "./types";
import { resolveActiveChat } from "./lib/active-chat";
import { prefetchChatMessages } from "./lib/messages-query";
import { useWebSocket } from "./hooks/useWebSocket";
import { MemoChatList } from "./components/MemoChatList";
import { ChatWindow } from "./components/ChatWindow";

async function fetchChats(): Promise<Chat[]> {
  const { data } = await api.get<Chat[]>("/api/chats");
  return data;
}

export default function ChatPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: session, isPending: sessionLoading } = useSession();

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!session,
  });

  const { connected, sendMessage, sendTyping, typingText, onlineUserIds } =
    useWebSocket({
      activeChatId,
    });

  const activeChat = resolveActiveChat(chatsQuery.data, activeChatId, null);

  useEffect(() => {
    if (!sessionLoading && !session) router.push("/auth/signin");
  }, [session, sessionLoading, router]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setMobileShowChat(true);
    void prefetchChatMessages(qc, chatId);
  };

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#a0a0a0] text-sm">
          <div className="w-4 h-4 border-2 border-[#26A69A] border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#121212] p-0 md:p-4">
      <div className="h-full flex overflow-hidden md:rounded-3xl md:shadow-2xl md:shadow-black/40 md:border md:border-[#2a2a2a] bg-[#1a1a1b]">
        <MemoChatList
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          mobileShowChat={mobileShowChat}
        />

        <main
          className={`${
            !mobileShowChat ? "hidden md:flex" : "flex"
          } flex-1 flex-col bg-[#121212] min-w-0`}
        >
          <ChatWindow
            chat={activeChat}
            connected={connected}
            typingText={typingText}
            onlineUserIds={onlineUserIds}
            onSendMessage={sendMessage}
            onSendTyping={sendTyping}
            onBack={() => setMobileShowChat(false)}
          />
        </main>
      </div>
    </div>
  );
}
