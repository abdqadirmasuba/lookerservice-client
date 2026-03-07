import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message } from '../../types';

interface MessagesState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: MessagesState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
      state.unreadCount = action.payload.reduce((sum, conv) => sum + conv.unreadCount, 0);
    },
    setActiveConversation(state, action: PayloadAction<Conversation | null>) {
      state.activeConversation = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages = [...state.messages, action.payload];
    },
    updateMessage(state, action: PayloadAction<Message>) {
      const index = state.messages.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const conv = state.conversations.find((c) => c.id === action.payload);
      if (conv) {
        state.unreadCount -= conv.unreadCount;
        conv.unreadCount = 0;
      }
      state.messages = state.messages.map((m) =>
        m.conversationId === action.payload ? { ...m, isRead: true } : m
      );
    },
    updateUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setMessagesLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setConversations,
  setActiveConversation,
  setMessages,
  addMessage,
  updateMessage,
  markAsRead,
  updateUnreadCount,
  setMessagesLoading,
} = messagesSlice.actions;

export default messagesSlice.reducer;
