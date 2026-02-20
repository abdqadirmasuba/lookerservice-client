import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Explore Providers</Text>
        <Text className="text-gray-600">Find the best service providers</Text>
      </View>
      <ScrollView className="flex-1 px-6">
        <View className="items-center justify-center py-20">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-gray-600 text-center">Search and explore providers</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
