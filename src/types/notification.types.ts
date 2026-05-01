export enum NotificationType {
  NEW_BID = 'new_bid',
  BID_ACCEPTED = 'bid_accepted',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  NEW_MESSAGE = 'new_message',
  PROMOTION = 'promotion',
  SERVICE_REMINDER = 'service_reminder',
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  source?: string;
  sourceId?: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  categories: {
    newBids: boolean;
    bookingConfirmations: boolean;
    paymentReceipts: boolean;
    messages: boolean;
    promotions: boolean;
  };
}
