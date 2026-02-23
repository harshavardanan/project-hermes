export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "error";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
  conversationId: string; // The specific ID for a DM or Group
}

export interface Group {
  id: string;
  name: string;
}

export interface ChatContextType {
  userId: string;
  projectId: string;
  isConnected: boolean;
  activeChatId: string | null;
  messages: Message[];
  groups: Group[];
  isTyping: boolean;
  setActiveChat: (id: string | null) => void;
  sendMessage: (text: string) => void;
  createGroup: (name: string) => void;
  sendTypingStatus: (isTyping: boolean) => void;
}
