import { Stack } from 'expo-router';

export default function ServiceRequestLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="create/step1" options={{ title: 'Select Category' }} />
      <Stack.Screen name="[id]" options={{ title: 'Request Details' }} />
    </Stack>
  );
}
