import { Stack } from 'expo-router';

export default function AccountLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="addresses" options={{ title: 'Saved Addresses' }} />
      <Stack.Screen name="payment-methods" options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notification Settings' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      <Stack.Screen name="support-lookerservices" options={{ title: 'Support Looker Services' }} />
      <Stack.Screen name="support-success" options={{ title: 'Payment Successful' }} />
      <Stack.Screen name="terms" options={{ title: 'Terms & Privacy' }} />
      <Stack.Screen
        name="delete-account"
        options={{ title: 'Delete Account', headerTintColor: '#EF4444' }}
      />
      <Stack.Screen name="account-settings" options={{ title: 'Account Settings' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}
