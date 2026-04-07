import { Stack } from 'expo-router';

export default function ServiceRequestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" options={{ title: 'Request Details' }} />
    </Stack>
  );
}
