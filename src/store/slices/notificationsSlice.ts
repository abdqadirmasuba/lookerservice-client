import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification, NotificationSettings } from '../../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
}

const defaultSettings: NotificationSettings = {
  push: true,
  email: true,
  sms: false,
  categories: {
    newBids: true,
    bookingConfirmations: true,
    paymentReceipts: true,
    messages: true,
    promotions: false,
  },
};

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  settings: defaultSettings,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      state.unreadCount = 0;
    },
    deleteNotification(state, action: PayloadAction<string>) {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount -= 1;
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    updateSettings(state, action: PayloadAction<Partial<NotificationSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateSettings,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
