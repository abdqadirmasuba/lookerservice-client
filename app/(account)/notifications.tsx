import { View, Text } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Notification Settings</Text>
      <Text className="text-gray-600 text-center">Manage your notification preferences</Text>
    </View>
  );
}
