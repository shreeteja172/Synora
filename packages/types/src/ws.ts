export const MessageType = {
  MESSAGE: "MESSAGE",
  TYPING: "TYPING",
  SEEN: "SEEN",
  NEW_MESSAGE: "NEW_MESSAGE",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface Sender {
  id: string;
  name: string;
  image?: string | null;
}

export interface MessagePayload {
  chatId: string;
  content: string;
  clientMessageId?: string;
}

export interface NewMessagePayload {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  createdAt: string;
  clientMessageId?: string;
}

export interface TypingPayload {
  chatId: string;
  sender: Sender;
}

export interface SeenPayload {
  chatId: string;
  sender: Sender;
}

export interface BaseMessage {
  type: MessageType;
}

export interface ChatMessage extends BaseMessage {
  type: "MESSAGE";
  payload: MessagePayload;
}

export interface NewMessageServer extends BaseMessage {
  type: "NEW_MESSAGE";
  payload: NewMessagePayload;
}

export interface TypingMessage extends BaseMessage {
  type: "TYPING";
  payload: TypingPayload;
}

export interface SeenMessage extends BaseMessage {
  type: "SEEN";
  payload: SeenPayload;
}

export type WsMessage =
  | ChatMessage
  | NewMessageServer
  | TypingMessage
  | SeenMessage;
