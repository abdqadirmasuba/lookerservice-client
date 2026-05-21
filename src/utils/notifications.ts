import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequests } from './apiRequests';

/**
 * Call once at app startup (module level) so the handler is registered before
 * any notification can arrive.
 */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

function handleRegistrationError(errorMessage: string): never {
  throw new Error(errorMessage);
}

/**
 * Requests permission and returns the Expo push token string,
 * or throws if the device / permissions are not suitable.
 */
export async function registerForPushNotificationsAsync(): Promise<string> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    handleRegistrationError('Must use a physical device for push notifications');
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted for push notifications');
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

  if (!projectId) {
    handleRegistrationError('Project ID not found in app config');
  }

  const pushTokenString = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;
  return pushTokenString;
}

/**
 * Registers the device push token with the backend.
 * Fails silently — push token registration is non-critical.
 */
export async function registerDevicePushToken(): Promise<void> {
  try {
    const token = await registerForPushNotificationsAsync();
    console.log('Push token obtained:', token);

    await apiRequests.patch('/installations/push-tokens', { push_token: token });
  } catch {
    // Fail silently
  }
}

/**
 * Test helper — sends a notification via Expo's push service using the
 * device's own token. Remove or gate behind __DEV__ before production.
 */
export async function sendTestPushNotification(expoPushToken: string): Promise<void> {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test Notification',
    body: 'Push notifications are working!',
    data: { test: true },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
