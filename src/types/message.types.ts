export interface Conversation {
  id: string;
  providerId: string;
  provider: {
    id: string;
    businessName: string;
    profileImage?: string;
  };
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}
