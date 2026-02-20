import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Request Details</Text>
      <Text className="text-gray-600">Request ID: {id}</Text>
    </View>
  );
}
