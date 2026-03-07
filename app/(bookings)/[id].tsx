import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Booking Details</Text>
      <Text className="text-gray-600">Booking ID: {id}</Text>
    </View>
  );
}
