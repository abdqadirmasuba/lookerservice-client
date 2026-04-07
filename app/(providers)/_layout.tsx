import { Stack } from 'expo-router';

export default function ProvidersLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]/profile" />
      <Stack.Screen name="[id]/request" />
    </Stack>
  );
}
