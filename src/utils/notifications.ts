import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerDevicePushToken as registerInstallationPushToken } from './installation';

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    throw new Error('Push notification permission not granted');
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const token = (tokenResponse as any).data ?? (tokenResponse as any).token ?? tokenResponse;

  if (!token) {
    throw new Error('Failed to obtain push token');
  }

  return typeof token === 'string' ? token : JSON.stringify(token);
}

export async function registerDevicePushToken(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    const pushToken = await registerForPushNotificationsAsync();
    await registerInstallationPushToken(pushToken, 'client');
  } catch (error: any) {
    console.warn('Push token registration failed:', error?.message || error);
  }
}

export async function sendTestPushNotification(_: string): Promise<void> {
  // Not implemented yet.
}
