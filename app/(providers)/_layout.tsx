import { Stack } from 'expo-router';

export default function ProvidersLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="[id]/profile" options={{ title: 'Provider Profile' }} />
    </Stack>
  );
}
