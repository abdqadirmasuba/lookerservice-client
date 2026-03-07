import { Stack } from 'expo-router';

export default function ServiceRequestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create/index" options={{ title: 'Create Request' }} />
      <Stack.Screen name="create/step1" options={{ title: 'Select Services' }} />
      <Stack.Screen name="create/step2" options={{ title: 'Budget & Schedule' }} />
      <Stack.Screen name="create/step3" options={{ title: 'Add Location' }} />
      <Stack.Screen name="create/step4" options={{ title: 'Review & Submit' }} />
      <Stack.Screen name="[id]" options={{ title: 'Request Details' }} />
    </Stack>
  );
}
