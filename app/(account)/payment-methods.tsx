import { View, Text } from 'react-native';

export default function PaymentMethodsScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <Text className="text-2xl font-bold text-gray-900 mb-4">Payment Methods</Text>
      <Text className="text-gray-600 text-center">Manage your payment methods</Text>
    </View>
  );
}
