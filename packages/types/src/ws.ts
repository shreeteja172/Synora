export const MessageType = {
  MESSAGE: "MESSAGE",
  TYPING: "TYPING",
  SEEN: "SEEN",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface MessagePayload {
  chatId: string;
  content: string;
}

export interface BaseMessage {
  type: MessageType;
}

export interface ChatMessage extends BaseMessage {
  type: "MESSAGE";
  payload: MessagePayload;
}

export interface TypingMessage extends BaseMessage {
  type: "TYPING";
}

export interface SeenMessage extends BaseMessage {
  type: "SEEN";
}

export type WsMessage = ChatMessage | TypingMessage | SeenMessage;
