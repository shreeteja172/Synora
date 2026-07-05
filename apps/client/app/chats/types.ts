interface ChatMember {
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

interface Chat {
  id: string;
  isGroup: boolean;
  name: string | null;
  members: ChatMember[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  chatId: string;
  senderId: string;
  createdAt: string;
}

interface UserSearchResult {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  image: string | null;
}

export type { Chat, Message, ChatMember, UserSearchResult };