"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "@/lib/auth-client";
import type { Chat, UserSearchResult } from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

async function fetchChats(): Promise<Chat[]> {
  const { data } = await api.get<Chat[]>("/api/chats");
  return data;
}

async function searchUsers(q: string): Promise<UserSearchResult[]> {
  const { data } = await api.get<UserSearchResult[]>(
    "/api/chats/users/search",
    { params: { q } },
  );
  return data;
}

async function createChat(receiverId: string): Promise<Chat> {
  const { data } = await api.post<Chat>("/api/chats", { receiverId });
  return data;
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

interface ChatListProps {
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  mobileShowChat: boolean;
}

export function ChatList({
  activeChatId,
  onSelectChat,
  mobileShowChat,
}: ChatListProps) {
  const qc = useQueryClient();
  const { data: session } = useSession();

  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
    enabled: !!session,
  });

  const usersQuery = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length > 0,
  });

  const createChatMut = useMutation({
    mutationFn: createChat,
    onSuccess: (chat) => {
      onSelectChat(chat.id);
      setShowNewChat(false);
      setSearchQuery("");
      qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return (
    <aside
      className={`${
        mobileShowChat ? "hidden md:flex" : "flex"
      } w-full md:w-80 flex-col border-r border-border bg-surface`}
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
          Chats
        </h2>
        <button
          onClick={() => {
            setShowNewChat(true);
            setSearchQuery("");
          }}
          className="w-6 h-6 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {showNewChat && (
        <div className="border-b border-border p-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1 text-xs text-white placeholder:text-dim/60 bg-white/3 border border-border rounded-lg px-3 py-2 outline-none focus:border-emerald/30"
              autoFocus
            />
            <button
              onClick={() => {
                setShowNewChat(false);
                setSearchQuery("");
              }}
              className="text-[10px] text-dim hover:text-white px-2"
            >
              Cancel
            </button>
          </div>
          {searchQuery.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {usersQuery.isLoading ? (
                <p className="text-[10px] text-dim px-2 py-1">
                  Searching...
                </p>
              ) : !usersQuery.data?.length ? (
                <p className="text-[10px] text-dim px-2 py-1">
                  No users found
                </p>
              ) : (
                usersQuery.data.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => createChatMut.mutate(user.id)}
                    disabled={createChatMut.isPending}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/3 transition-colors text-left"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-emerald/10 text-emerald text-[9px] font-semibold flex items-center justify-center">
                        {getInitials(user.name || user.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-[10px] text-dim truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {chatsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !chatsQuery.data?.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-xs text-dim">No conversations yet</p>
          </div>
        ) : (
          chatsQuery.data.map((chat) => {
            const other = chat.members.find(
              (m) => m.user.id !== session?.user?.id,
            );
            const displayName = chat.isGroup
              ? chat.name
              : other?.user.name || other?.user.username || "User";
            const displayImage = other?.user.image;
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-white/4"
                    : "hover:bg-white/2"
                }`}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt=""
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald/10 text-emerald text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(displayName || "U")}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium truncate">
                      {displayName}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-dim shrink-0 ml-2">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-[11px] text-dim truncate mt-0.5">
                      {chat.lastMessage.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
