// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { MessageType, type WsMessage } from "@repo/types/ws";
// import { useSession, signOut } from "@/lib/auth-client";
// import type { Chat, Message, UserSearchResult } from "./types";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });

// async function fetchChats(): Promise<Chat[]> {
//   const { data } = await api.get<Chat[]>("/api/chats");
//   return data;
// }

// async function fetchMessages(chatId: string): Promise<Message[]> {
//   const { data } = await api.get<Message[]>(`/api/chats/${chatId}/messages`);
//   return data.reverse();
// }

// async function searchUsers(q: string): Promise<UserSearchResult[]> {
//   const { data } = await api.get<UserSearchResult[]>(
//     "/api/chats/users/search",
//     { params: { q } },
//   );
//   return data;
// }

// async function createChat(receiverId: string): Promise<Chat> {
//   const { data } = await api.post<Chat>("/api/chats", { receiverId });
//   return data;
// }

// export default function ChatPage() {
//   const router = useRouter();
//   const qc = useQueryClient();
//   const { data: session, isPending: sessionLoading } = useSession();
//   const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

//   const [activeChatId, setActiveChatId] = useState<string | null>(null);
//   const [input, setInput] = useState("");
//   const [connected, setConnected] = useState(false);
//   const [typingSenders, setTypingSenders] = useState<
//     Map<string, { name: string; timeout: ReturnType<typeof setTimeout> }>
//   >(new Map());
//   const [mobileShowChat, setMobileShowChat] = useState(false);
//   const [showNewChat, setShowNewChat] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const wsRef = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const typingThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const scrollToBottom = useCallback(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, []);

//   const chatsQuery = useQuery({
//     queryKey: ["chats"],
//     queryFn: fetchChats,
//     enabled: !!session,
//   });
//   const messagesQuery = useQuery({
//     queryKey: ["messages", activeChatId],
//     queryFn: () => fetchMessages(activeChatId!),
//     enabled: !!activeChatId,
//   });
//   const usersQuery = useQuery({
//     queryKey: ["users", searchQuery],
//     queryFn: () => searchUsers(searchQuery),
//     enabled: searchQuery.length > 0,
//   });

//   const createChatMut = useMutation({
//     mutationFn: createChat,
//     onSuccess: (chat) => {
//       setActiveChatId(chat.id);
//       setShowNewChat(false);
//       setSearchQuery("");
//       qc.invalidateQueries({ queryKey: ["chats"] });
//       setMobileShowChat(true);
//     },
//   });

//   const activeChat = chatsQuery.data?.find((c) => c.id === activeChatId);
//   const otherMember = activeChat?.members.find(
//     (m) => m.user.id !== session?.user?.id,
//   );
//   const messages = messagesQuery.data ?? [];

//   useEffect(() => {
//     if (messages.length > 0) setTimeout(scrollToBottom, 50);
//   }, [messages.length, scrollToBottom]);

//   useEffect(() => {
//     if (!sessionLoading && !session) router.push("/auth/signin");
//   }, [session, sessionLoading, router]);

//   useEffect(() => {
//     if (!session) return;
//     const ws = new WebSocket(wsUrl);
//     ws.onopen = () => setConnected(true);
//     ws.onclose = () => setConnected(false);
//     ws.onerror = () => setConnected(false);
//     ws.onmessage = (e) => {
//       try {
//         const msg: WsMessage = JSON.parse(e.data);
//         switch (msg.type) {
//           case MessageType.NEW_MESSAGE: {
//             const p = msg.payload;
//             if (p.chatId === activeChatId) {
//               qc.setQueryData<Message[]>(["messages", activeChatId], (old) => {
//                 if (!old) return old;
//                 if (old.some((m) => m.id === p.id)) return old;
//                 return [
//                   ...old,
//                   {
//                     id: p.id,
//                     content: p.content,
//                     chatId: p.chatId,
//                     senderId: p.senderId,
//                     createdAt: p.createdAt,
//                   },
//                 ];
//               });
//             }
//             qc.invalidateQueries({ queryKey: ["chats"] });
//             break;
//           }
//           case MessageType.MESSAGE: {
//             qc.invalidateQueries({
//               queryKey: ["messages", msg.payload.chatId],
//             });
//             qc.invalidateQueries({ queryKey: ["chats"] });
//             break;
//           }
//           case MessageType.TYPING: {
//             if (msg.payload.sender.id === session?.user?.id) break;
//             if (msg.payload.chatId !== activeChatId) break;
//             const senderId = msg.payload.sender.id;
//             setTypingSenders((prev) => {
//               const next = new Map(prev);
//               const existing = next.get(senderId);
//               if (existing) clearTimeout(existing.timeout);
//               const timeout = setTimeout(() => {
//                 setTypingSenders((p) => {
//                   const n = new Map(p);
//                   n.delete(senderId);
//                   return n;
//                 });
//               }, 2000);
//               next.set(senderId, { name: msg.payload.sender.name, timeout });
//               return next;
//             });
//             break;
//           }
//         }
//       } catch {}
//     };
//     wsRef.current = ws;
//     return () => {
//       ws.close();
//       if (typingThrottleRef.current) clearTimeout(typingThrottleRef.current);
//     };
//   }, [session, activeChatId, wsUrl, qc]);

//   const sendMessage = () => {
//     if (!input.trim() || !wsRef.current || !activeChatId) return;
//     wsRef.current.send(
//       JSON.stringify({
//         type: MessageType.MESSAGE,
//         payload: { chatId: activeChatId, content: input },
//       }),
//     );
//     setInput("");
//   };

//   const handleTyping = () => {
//     if (!wsRef.current || !activeChatId || typingThrottleRef.current) return;
//     wsRef.current.send(
//       JSON.stringify({
//         type: MessageType.TYPING,
//         payload: {
//           chatId: activeChatId,
//           sender: {
//             id: session?.user?.id || "",
//             name: session?.user?.name || "",
//           },
//         },
//       }),
//     );
//     typingThrottleRef.current = setTimeout(() => {
//       typingThrottleRef.current = null;
//     }, 1000);
//   };

//   const handleSignOut = async () => {
//     await signOut();
//     router.push("/auth/signin");
//   };

//   const formatTime = (iso: string) => {
//     try {
//       return new Date(iso).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "";
//     }
//   };
//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((w) => w[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);

//   if (sessionLoading || !session) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="flex items-center gap-3 text-dim text-sm">
//           <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
//           Loading...
//         </div>
//       </div>
//     );
//   }

//   const typingNames = Array.from(typingSenders.values()).map((s) => s.name);
//   const typingText =
//     typingNames.length === 1
//       ? `${typingNames[0]} is typing`
//       : typingNames.length === 2
//         ? `${typingNames[0]} and ${typingNames[1]} are typing`
//         : typingNames.length > 2
//           ? "Several people are typing"
//           : "";

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-20">
//         <div className="flex items-center justify-between px-4 py-2.5">
//           <div className="flex items-center gap-2.5">
//             <div className="w-7 h-7 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
//               <svg
//                 className="w-3.5 h-3.5 text-emerald"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
//                 />
//               </svg>
//             </div>
//             <span className="text-sm font-semibold text-white tracking-tight">
//               Synora
//             </span>
//             <span
//               className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald" : "bg-rose-400"}`}
//             />
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/3 border border-border">
//               {session.user.image ? (
//                 <Image
//                   src={session.user.image}
//                   alt=""
//                   width={16}
//                   height={16}
//                   className="w-4 h-4 rounded-full"
//                 />
//               ) : (
//                 <div className="w-4 h-4 rounded-full bg-emerald/10 text-emerald text-[8px] font-semibold flex items-center justify-center">
//                   {getInitials(session.user.name || session.user.email)}
//                 </div>
//               )}
//               <span className="text-[11px] text-white font-medium">
//                 {session.user.name || session.user.email}
//               </span>
//             </div>
//             <button
//               onClick={handleSignOut}
//               className="text-[10px] text-dim hover:text-white transition-colors px-1.5 py-1 rounded hover:bg-white/[0.03]"
//             >
//               Sign out
//             </button>
//           </div>
//         </div>
//       </header>

//       <div className="flex-1 flex overflow-hidden">
//         <aside
//           className={`${mobileShowChat ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col border-r border-border bg-surface`}
//         >
//           <div className="px-4 py-3 border-b border-border flex items-center justify-between">
//             <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">
//               Chats
//             </h2>
//             <button
//               onClick={() => {
//                 setShowNewChat(true);
//                 setSearchQuery("");
//               }}
//               className="w-6 h-6 rounded-lg bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 transition-colors"
//             >
//               <svg
//                 className="w-3.5 h-3.5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 4.5v15m7.5-7.5h-15"
//                 />
//               </svg>
//             </button>
//           </div>

//           {showNewChat && (
//             <div className="border-b border-border p-3 space-y-2">
//               <div className="flex gap-2">
//                 <input
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search users..."
//                   className="flex-1 text-xs text-white placeholder:text-dim/60 bg-white/3 border border-border rounded-lg px-3 py-2 outline-none focus:border-emerald/30"
//                   autoFocus
//                 />
//                 <button
//                   onClick={() => {
//                     setShowNewChat(false);
//                     setSearchQuery("");
//                   }}
//                   className="text-[10px] text-dim hover:text-white px-2"
//                 >
//                   Cancel
//                 </button>
//               </div>
//               {searchQuery.length > 0 && (
//                 <div className="max-h-48 overflow-y-auto space-y-0.5">
//                   {usersQuery.isLoading ? (
//                     <p className="text-[10px] text-dim px-2 py-1">
//                       Searching...
//                     </p>
//                   ) : !usersQuery.data?.length ? (
//                     <p className="text-[10px] text-dim px-2 py-1">
//                       No users found
//                     </p>
//                   ) : (
//                     usersQuery.data.map((user) => (
//                       <button
//                         key={user.id}
//                         onClick={() => createChatMut.mutate(user.id)}
//                         disabled={createChatMut.isPending}
//                         className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
//                       >
//                         {user.image ? (
//                           <Image
//                             src={user.image}
//                             alt=""
//                             width={28}
//                             height={28}
//                             className="w-7 h-7 rounded-full"
//                           />
//                         ) : (
//                           <div className="w-7 h-7 rounded-full bg-emerald/10 text-emerald text-[9px] font-semibold flex items-center justify-center">
//                             {getInitials(user.name || user.email)}
//                           </div>
//                         )}
//                         <div className="min-w-0">
//                           <p className="text-xs text-white font-medium truncate">
//                             {user.name || user.username}
//                           </p>
//                           <p className="text-[10px] text-dim truncate">
//                             {user.email}
//                           </p>
//                         </div>
//                       </button>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           <div className="flex-1 overflow-y-auto">
//             {chatsQuery.isLoading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : !chatsQuery.data?.length ? (
//               <div className="px-4 py-12 text-center">
//                 <p className="text-xs text-dim">No conversations yet</p>
//               </div>
//             ) : (
//               chatsQuery.data.map((chat) => {
//                 const other = chat.members.find(
//                   (m) => m.user.id !== session?.user?.id,
//                 );
//                 const displayName = chat.isGroup
//                   ? chat.name
//                   : other?.user.name || other?.user.username || "User";
//                 const displayImage = other?.user.image;
//                 const isActive = chat.id === activeChatId;
//                 return (
//                   <button
//                     key={chat.id}
//                     onClick={() => {
//                       setActiveChatId(chat.id);
//                       setMobileShowChat(true);
//                     }}
//                     className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}
//                   >
//                     {displayImage ? (
//                       <Image
//                         src={displayImage}
//                         alt=""
//                         width={36}
//                         height={36}
//                         className="w-9 h-9 rounded-full shrink-0"
//                       />
//                     ) : (
//                       <div className="w-9 h-9 rounded-full bg-emerald/10 text-emerald text-xs font-semibold flex items-center justify-center flex-shrink-0">
//                         {getInitials(displayName || "U")}
//                       </div>
//                     )}
//                     <div className="flex-1 min-w-0 text-left">
//                       <div className="flex items-center justify-between">
//                         <span className="text-sm text-white font-medium truncate">
//                           {displayName}
//                         </span>
//                         {chat.lastMessage && (
//                           <span className="text-[10px] text-dim shrink-0 ml-2">
//                             {formatTime(chat.lastMessage.createdAt)}
//                           </span>
//                         )}
//                       </div>
//                       {chat.lastMessage && (
//                         <p className="text-[11px] text-dim truncate mt-0.5">
//                           {chat.lastMessage.content}
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         </aside>

//         <main
//           className={`${!mobileShowChat ? "hidden md:flex" : "flex"} flex-1 flex-col bg-background`}
//         >
//           {activeChatId && otherMember ? (
//             <>
//               <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/50">
//                 <button
//                   onClick={() => setMobileShowChat(false)}
//                   className="md:hidden text-dim hover:text-white mr-1"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={2}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M15 19l-7-7 7-7"
//                     />
//                   </svg>
//                 </button>
//                 {otherMember.user.image ? (
//                   <Image
//                     src={otherMember.user.image}
//                     alt=""
//                     width={32}
//                     height={32}
//                     className="w-8 h-8 rounded-full"
//                   />
//                 ) : (
//                   <div className="w-8 h-8 rounded-full bg-emerald/10 text-emerald text-[11px] font-semibold flex items-center justify-center">
//                     {getInitials(otherMember.user.name || "U")}
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm font-medium text-white">
//                     {otherMember.user.name || otherMember.user.username}
//                   </p>
//                   <p className="text-[10px] text-emerald">Online</p>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto px-4 py-4">
//                 <div className="max-w-2xl mx-auto space-y-1">
//                   {messagesQuery.isLoading ? (
//                     <div className="flex items-center justify-center py-12">
//                       <div className="w-4 h-4 border-2 border-emerald border-t-transparent rounded-full animate-spin" />
//                     </div>
//                   ) : (
//                     messages.map((msg) => {
//                       const isOwn = msg.senderId === session?.user?.id;
//                       return (
//                         <div
//                           key={msg.id}
//                           className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
//                         >
//                           <div className="max-w-[75%]">
//                             <div
//                               className={`text-sm px-3.5 py-2 rounded-2xl ${isOwn ? "bg-emerald/10 text-white border border-emerald/10 rounded-br-md" : "bg-white/3 text-white border border-border rounded-bl-md"}`}
//                             >
//                               {msg.content}
//                             </div>
//                             <p
//                               className={`text-[10px] text-dim mt-0.5 ${isOwn ? "text-right" : "text-left"}`}
//                             >
//                               {formatTime(msg.createdAt)}
//                             </p>
//                           </div>
//                         </div>
//                       );
//                     })
//                   )}
//                   {typingText && (
//                     <div className="flex items-center gap-1.5 px-1 py-1">
//                       <div className="flex gap-0.5">
//                         <span className="w-1 h-1 rounded-full bg-dim typing-dot-1" />
//                         <span className="w-1 h-1 rounded-full bg-dim typing-dot-2" />
//                         <span className="w-1 h-1 rounded-full bg-dim typing-dot-3" />
//                       </div>
//                       <span className="text-[10px] text-dim">{typingText}</span>
//                     </div>
//                   )}
//                   <div ref={messagesEndRef} />
//                 </div>
//               </div>

//               <div className="border-t border-border bg-surface/50 px-4 py-3">
//                 <div className="max-w-2xl mx-auto flex gap-2 items-end rounded-2xl bg-white/[0.03] border border-border px-4 py-2 focus-within:border-emerald/30 transition-colors">
//                   <input
//                     type="text"
//                     value={input}
//                     onChange={(e) => {
//                       setInput(e.target.value);
//                       handleTyping();
//                     }}
//                     onKeyDown={(e) =>
//                       e.key === "Enter" && !e.shiftKey && sendMessage()
//                     }
//                     placeholder="Type a message..."
//                     className="flex-1 text-sm text-white placeholder:text-dim/60 outline-none bg-transparent py-1"
//                   />
//                   <button
//                     onClick={sendMessage}
//                     disabled={!connected || !input.trim()}
//                     className="shrink-0 w-8 h-8 rounded-xl bg-emerald/10 text-emerald flex items-center justify-center hover:bg-emerald/20 disabled:opacity-30 transition-colors"
//                   >
//                     <svg
//                       className="w-4 h-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
//                       />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center">
//               <div className="text-center">
//                 <div className="w-14 h-14 rounded-2xl bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto mb-4">
//                   <svg
//                     className="w-7 h-7 text-emerald"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                     strokeWidth={1.5}
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
//                     />
//                   </svg>
//                 </div>
//                 <p className="text-sm text-dim">
//                   Select a conversation to start messaging
//                 </p>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }
const page = () => {
  return (
    <div>page</div>
  )
}

export default page