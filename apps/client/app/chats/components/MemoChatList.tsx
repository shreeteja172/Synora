"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSession, signOut } from "@/lib/auth-client";
import type { Chat, UserSearchResult } from "../types";
import { upsertChatInList } from "../lib/active-chat";
import { prefetchChatMessages } from "../lib/messages-query";

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

function ChatList({
  activeChatId,
  onSelectChat,
  mobileShowChat,
}: ChatListProps) {
  const qc = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();

  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listFilter, setListFilter] = useState("");

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
      qc.setQueryData<Chat[]>(["chats"], (old) => upsertChatInList(old, chat));
      onSelectChat(chat.id);
      setShowNewChat(false);
      setSearchQuery("");
      qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/signin");
  };

  const users = usersQuery.data ?? [];
  const chats = chatsQuery.data ?? [];
  const displayName = session?.user?.name || session?.user?.email || "You";
  const filteredChats = chats.filter((chat) => {
    if (!listFilter.trim()) return true;
    const other = chat.members.find((m) => m.user.id !== session?.user?.id);
    const name = chat.isGroup
      ? chat.name
      : other?.user.name || other?.user.username || "";
    return (name || "").toLowerCase().includes(listFilter.toLowerCase());
  });

  return (
    <aside
      className={`${
        mobileShowChat ? "hidden md:flex" : "flex"
      } w-full md:w-[340px] flex-col bg-[#1e1e1e] border-r border-[#2a2a2a]`}
    >
      <div className="px-5 pt-5 pb-2 flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[#a0a0a0]"
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
        <h2 className="text-lg font-semibold text-[#f5f5f5]">Chat</h2>
      </div>

      <div className="px-5 pt-4 pb-6 flex flex-col items-center text-center">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={88}
            height={88}
            className="w-[88px] h-[88px] rounded-full object-cover ring-2 ring-[#26A69A]/40"
          />
        ) : (
          <div className="w-[88px] h-[88px] rounded-full bg-[#26A69A]/15 text-[#26A69A] text-2xl font-semibold flex items-center justify-center ring-2 ring-[#26A69A]/40">
            {getInitials(displayName)}
          </div>
        )}
        <p className="mt-3 text-base font-semibold text-[#f5f5f5]">
          {displayName}
        </p>
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#2c2c2e] px-3 py-1 text-xs text-[#f5f5f5]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#26A69A]" />
          Available
          <svg
            className="w-3 h-3 text-[#a0a0a0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 text-[11px] text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 rounded-2xl bg-[#2c2c2e] px-3.5 py-2.5">
          <svg
            className="w-4 h-4 text-[#a0a0a0] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            value={showNewChat ? searchQuery : listFilter}
            onChange={(e) => {
              if (showNewChat) {
                setSearchQuery(e.target.value);
              } else {
                setListFilter(e.target.value);
              }
            }}
            placeholder="Search"
            className="flex-1 text-sm text-[#f5f5f5] placeholder:text-[#a0a0a0] bg-transparent outline-none"
          />
        </div>
      </div>

      {showNewChat && (
        <div className="px-5 pb-3 space-y-2 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#a0a0a0]">Start a new chat</p>
            <button
              type="button"
              onClick={() => {
                setShowNewChat(false);
                setSearchQuery("");
              }}
              className="text-[11px] text-[#a0a0a0] hover:text-[#f5f5f5]"
            >
              Cancel
            </button>
          </div>
          {searchQuery.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {usersQuery.isLoading ? (
                <p className="text-[11px] text-[#a0a0a0] px-2 py-1">
                  Searching...
                </p>
              ) : !users.length ? (
                <p className="text-[11px] text-[#a0a0a0] px-2 py-1">
                  No users found
                </p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => createChatMut.mutate(user.id)}
                    disabled={createChatMut.isPending}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-[#2c2c2e] transition-colors text-left"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#26A69A]/15 text-[#26A69A] text-[10px] font-semibold flex items-center justify-center">
                        {getInitials(user.name || user.email)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-[#f5f5f5] font-medium truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-[11px] text-[#a0a0a0] truncate">
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

      <div className="px-5 pb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#f5f5f5]">Last chats</h3>
        <button
          type="button"
          onClick={() => {
            setShowNewChat(true);
            setSearchQuery("");
            setListFilter("");
          }}
          className="w-7 h-7 rounded-lg text-[#26A69A] hover:bg-[#26A69A]/10 flex items-center justify-center transition-colors"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {chatsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-4 h-4 border-2 border-[#26A69A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !filteredChats.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-[#a0a0a0]">No conversations yet</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const other = chat.members.find(
              (m) => m.user.id !== session?.user?.id,
            );
            const chatName = chat.isGroup
              ? chat.name
              : other?.user.name || other?.user.username || "User";
            const displayImage = other?.user.image;
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => onSelectChat(chat.id)}
                onPointerDown={() => prefetchChatMessages(qc, chat.id)}
                onMouseEnter={() => prefetchChatMessages(qc, chat.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors ${
                  isActive ? "bg-[#2c2c2e]" : "hover:bg-[#262626]"
                }`}
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt=""
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-full shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#26A69A]/15 text-[#26A69A] text-sm font-semibold flex items-center justify-center shrink-0">
                    {getInitials(chatName || "U")}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[#f5f5f5] font-semibold truncate">
                      {chatName}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-[11px] text-[#a0a0a0] shrink-0">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-[12px] text-[#a0a0a0] truncate mt-0.5">
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

export const MemoChatList = memo(ChatList);
