import "@/global.css";
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { store, persistor } from '@/src/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { addNotification, setPushToken } from '@/src/store/slices/notificationsSlice';
import {
  setupNotificationHandler,
  registerForPushNotificationsAsync,
} from '@/src/utils/notifications';

// Register the handler before any component renders so no notification is missed
setupNotificationHandler();

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

function NotificationSetup() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Register device and persist token in Redux
    registerForPushNotificationsAsync()
      .then((token) => store.dispatch(setPushToken(token)))
      .catch((err) => console.warn('[PushToken] Registration failed:', err));

    // Fired when a notification arrives while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;
        store.dispatch(
          addNotification({
            id: notification.request.identifier,
            userId: '',
            type: (data?.type as string) ?? 'push',
            title: title ?? '',
            message: body ?? '',
            isRead: false,
            data: data as Record<string, unknown> | undefined,
            createdAt: new Date().toISOString(),
          })
        );
      }
    );

    // Fired when the user taps a notification (foreground or background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // TODO: navigate based on response.notification.request.content.data when backend is integrated
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View className="flex-1 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#2DA9E9" />
          </View>
        }
        persistor={persistor}
      >
        <NotificationSetup />
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth-loading" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(providers)" />
          <Stack.Screen name="(explore)" />
          <Stack.Screen name="(service-request)" />
          <Stack.Screen name="(bookings)" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}

