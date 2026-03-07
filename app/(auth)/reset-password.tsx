import { View, Text } from 'react-native';

export default function ResetPassword() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Reset Password</Text>
      <Text className="text-gray-600 text-center">Set your new password</Text>
    </View>
  );
}
