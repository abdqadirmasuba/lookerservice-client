import { View, Text } from 'react-native';

export default function Step2Screen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Service Details</Text>
      <Text className="text-gray-600 text-center">Describe your service request</Text>
    </View>
  );
}
