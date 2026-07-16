"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import type { Chat, Message } from "../types";
import { getMessagesInfiniteQueryOptions } from "../lib/messages-query";
import { MemoMessageInput } from "./MessageInput";

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
  onlineUserIds: Set<string>;
  onSendMessage: (chatId: string, content: string) => void;
  onSendTyping: (chatId: string) => void;
  onBack: () => void;
}

const MessageList = function MessageList({
  messages,
  userId,
  members,
  isLoading,
}: {
  messages: Message[];
  userId: string | undefined;
  members: Chat["members"];
  isLoading: boolean;
}) {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-4 h-4 border-2 border-[#26A69A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => {
        const isOwn = msg.senderId === userId;
        const sender = members.find((m) => m.user.id === msg.senderId)?.user;
        const senderName = sender?.name || sender?.username || "User";
        const senderImage = sender?.image;

        return (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${isOwn ? "justify-end" : "justify-start"}`}
          >
            {!isOwn &&
              (senderImage ? (
                <Image
                  src={senderImage}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0 mt-5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#26A69A]/15 text-[#26A69A] text-[10px] font-semibold flex items-center justify-center shrink-0 mt-5">
                  {getInitials(senderName)}
                </div>
              ))}

            <div
              className={`max-w-[70%] ${
                isOwn ? "items-end" : "items-start"
              } flex flex-col`}
            >
              <div
                className={`flex items-center gap-2 mb-1 px-1 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {!isOwn && (
                  <span className="text-xs font-medium text-[#f5f5f5]">
                    {senderName}
                  </span>
                )}
                <span className="text-[11px] text-[#a0a0a0]">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <div
                className={`text-sm leading-relaxed ${
                  isOwn
                    ? "bg-[#3f3d56] text-[#f5f5f5] rounded-2xl rounded-tr-md"
                    : "bg-[#2c2c2e] text-[#f5f5f5] rounded-2xl rounded-tl-md"
                } ${msg.content.startsWith("[IMAGE]") ? "p-1.5" : "px-4 py-2.5"}`}
              >
                {msg.content.startsWith("[IMAGE]") ? (
                  <Image
                    src={msg.content.replace("[IMAGE]", "")}
                    alt="attachment"
                    width={300}
                    height={300}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export function ChatWindow({
  chat,
  connected,
  typingText,
  onlineUserIds,
  onSendMessage,
  onSendTyping,
  onBack,
}: ChatWindowProps) {
  const { data: session } = useSession();
  const chatId = chat?.id ?? null;
  const [activeTab, setActiveTab] = useState<"messages" | "participants">(
    "messages",
  );
  const messageScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousScrollHeightRef = useRef(0);
  const previousChatIdRef = useRef<string | null>(null);
  const isInitialHydratedRef = useRef(false);
  const isLoadingOlderRef = useRef(false);

  const otherMember = chat?.members.find(
    (m) => m.user.id !== session?.user?.id,
  );

  const isOnline = otherMember ? onlineUserIds.has(otherMember.user.id) : false;

  const chatTitle = chat?.isGroup
    ? chat.name || "Group Chat"
    : otherMember?.user.name || otherMember?.user.username || "Chat";

  const chatImage = chat?.isGroup ? null : otherMember?.user.image;

  const messagesQuery = useInfiniteQuery(
    getMessagesInfiniteQueryOptions(chatId),
  );

  const messages = useMemo(
    () => messagesQuery.data?.pages.flat() ?? [],
    [messagesQuery.data],
  );

  const loadOlderMessages = async () => {
    if (
      !messagesQuery.hasPreviousPage ||
      messagesQuery.isFetchingPreviousPage ||
      !chatId
    ) {
      return;
    }

    const scroller = messageScrollRef.current;
    if (!scroller) return;

    previousScrollHeightRef.current = scroller.scrollHeight;
    isLoadingOlderRef.current = true;
    await messagesQuery.fetchPreviousPage();
  };

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    isInitialHydratedRef.current = false;
    isLoadingOlderRef.current = false;
    setActiveTab("messages");
  }, [chatId]);

  useLayoutEffect(() => {
    const scroller = messageScrollRef.current;
    if (!scroller) return;

    if (previousChatIdRef.current !== chatId) {
      previousChatIdRef.current = chatId;
      scroller.scrollTop = scroller.scrollHeight;
      isInitialHydratedRef.current = true;
      return;
    }

    if (!isInitialHydratedRef.current && messages.length > 0) {
      scroller.scrollTop = scroller.scrollHeight;
      isInitialHydratedRef.current = true;
      previousScrollHeightRef.current = scroller.scrollHeight;
      return;
    }

    if (isLoadingOlderRef.current) {
      const heightDelta =
        scroller.scrollHeight - previousScrollHeightRef.current;
      scroller.scrollTop = scroller.scrollTop + heightDelta;
      previousScrollHeightRef.current = scroller.scrollHeight;
      isLoadingOlderRef.current = false;
      return;
    }

    if (shouldStickToBottomRef.current) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  }, [messages.length, chatId]);

  if (!chat || !otherMember) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#121212]">
        <div className="text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#26A69A]/10 border border-[#26A69A]/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-[#26A69A]"
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
          <p className="text-sm text-[#a0a0a0]">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#121212] min-h-0">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden text-[#a0a0a0] hover:text-[#f5f5f5]"
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
          
          <div className="shrink-0">
            {chatImage ? (
              <Image
                src={chatImage}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#26A69A]/15 text-[#26A69A] text-sm font-semibold flex items-center justify-center">
                {getInitials(chatTitle)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-base font-semibold text-[#f5f5f5] truncate">
              {chatTitle}
            </p>
            <p
              className={`text-[11px] ${
                isOnline ? "text-[#26A69A]" : "text-[#a0a0a0]"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-full bg-[#2c2c2e] p-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("messages")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === "messages"
                ? "bg-[#26A69A] text-white"
                : "text-[#a0a0a0] hover:text-[#f5f5f5]"
            }`}
          >
            Messages
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("participants")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === "participants"
                ? "bg-[#26A69A] text-white"
                : "text-[#a0a0a0] hover:text-[#f5f5f5]"
            }`}
          >
            Participants
          </button>
        </div>
      </div>

      {activeTab === "participants" ? (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="space-y-2 max-w-xl">
            {chat.members.map((member) => {
              const memberOnline = onlineUserIds.has(member.user.id);
              return (
                <li
                  key={member.user.id}
                  className="flex items-center gap-3 rounded-2xl bg-[#1e1e1e] px-4 py-3"
                >
                  {member.user.image ? (
                    <Image
                      src={member.user.image}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#26A69A]/15 text-[#26A69A] text-xs font-semibold flex items-center justify-center">
                      {getInitials(
                        member.user.name || member.user.username || "U",
                      )}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#f5f5f5] truncate">
                      {member.user.name || member.user.username}
                      {member.user.id === session?.user?.id ? " (You)" : ""}
                    </p>
                    <p
                      className={`text-[11px] ${
                        memberOnline ? "text-[#26A69A]" : "text-[#a0a0a0]"
                      }`}
                    >
                      {memberOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <>
          <div
            ref={messageScrollRef}
            onScroll={(e) => {
              const target = e.currentTarget;
              const nearBottom =
                target.scrollTop + target.clientHeight >=
                target.scrollHeight - 120;
              shouldStickToBottomRef.current = nearBottom;

              if (target.scrollTop <= 40) {
                void loadOlderMessages();
              }
            }}
            className="flex-1 overflow-y-auto px-5 py-5"
            style={{ overflowAnchor: "none" }}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              <MessageList
                messages={messages}
                userId={session?.user?.id}
                members={chat.members}
                isLoading={messagesQuery.isLoading && messages.length === 0}
              />
              {typingText && (
                <div className="flex items-center gap-1.5 px-1 py-1">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-[#a0a0a0] typing-dot-1" />
                    <span className="w-1 h-1 rounded-full bg-[#a0a0a0] typing-dot-2" />
                    <span className="w-1 h-1 rounded-full bg-[#a0a0a0] typing-dot-3" />
                  </div>
                  <span className="text-[11px] text-[#a0a0a0]">
                    {typingText}
                  </span>
                </div>
              )}
            </div>
          </div>

          <MemoMessageInput
            chatId={chat.id}
            connected={connected}
            onSendMessage={onSendMessage}
            onSendTyping={onSendTyping}
          />
        </>
      )}
    </div>
  );
}
