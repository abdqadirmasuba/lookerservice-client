import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { store, persistor } from '@/src/store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import "@/global.css";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

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
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth-loading" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(providers)" />
          <Stack.Screen name="(service-request)" />
          <Stack.Screen name="(bookings)" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
