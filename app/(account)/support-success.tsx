import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SupportSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="w-20 h-20 rounded-full items-center justify-center mb-6"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <Ionicons name="checkmark" size={42} color="#16A34A" />
        </View>
        <Text className="text-gray-500 text-center leading-6 mb-8">
          Thank you for supporting Looker Services.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/account')}
          activeOpacity={0.85}
          className="w-full py-4 rounded-xl items-center"
          style={{ backgroundColor: '#2DA9E9' }}
        >
          <Text className="text-white text-base font-bold">Back to Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
