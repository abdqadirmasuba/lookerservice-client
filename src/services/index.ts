export * from './auth.service';
export * from './user.service';
export * from './categories.service';
export * from './providers.service';
export * from './requests.service';
export * from './bookings.service';
export * from './payments.service';
export * from './messages.service';

// Export notifications with aliases to avoid naming conflicts
export {
  getNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
} from './notifications.service';
