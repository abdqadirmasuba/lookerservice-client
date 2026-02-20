import { View, Text } from 'react-native';

export default function HelpScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Help & Support</Text>
      <Text className="text-gray-600 text-center">Get help with LookerService</Text>
    </View>
  );
}
