// Push notification support has been removed from the client.
// This module remains as a stub to avoid import errors while the new approach is implemented.

export function setupNotificationHandler(): void {}
export async function registerForPushNotificationsAsync(): Promise<string> {
  throw new Error('Push notifications are disabled');
}
export async function registerDevicePushToken(): Promise<void> {}
export async function sendTestPushNotification(_: string): Promise<void> {}