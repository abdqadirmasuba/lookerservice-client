import { View, Text } from 'react-native';

export default function VerifyEmail() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Verify Your Email</Text>
      <Text className="text-gray-600 text-center">Check your email for verification link</Text>
    </View>
  );
}
