import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/store/hooks';

export default function Step1Screen() {
  const router = useRouter();
  const categories = useAppSelector((state) => state.categories.categories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedCategory) {
      router.push('/(service-request)/create/step2');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 py-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Select a category for your service request
        </Text>

        <View className="flex-row flex-wrap -mx-2">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`w-1/2 px-2 mb-4`}
            >
              <View
                className={`p-4 rounded-xl border-2 ${
                  selectedCategory === category.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <Text className="text-3xl mb-2">{category.icon}</Text>
                <Text className="font-semibold text-gray-900">{category.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="px-6 pb-6 pt-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selectedCategory}
          className={`py-4 rounded-xl items-center ${
            selectedCategory ? 'bg-primary-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-semibold text-lg">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
