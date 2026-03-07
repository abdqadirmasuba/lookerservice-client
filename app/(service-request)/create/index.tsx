import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/store/hooks';
import { initializeOpenRequest, initializeDirectRequest } from '@/src/store/slices/serviceRequestFormSlice';
import { Ionicons } from '@expo/vector-icons';

export default function RequestTypeSelectionScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleOpenRequest = () => {
    dispatch(initializeOpenRequest());
    router.push('/(service-request)/create/step1');
  };

  const handleDirectRequest = () => {
    // For direct request, user should come from provider profile
    // This button redirects to explore page
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155]">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-primary-600 dark:text-primary-300 text-3xl font-light">‹</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              Create Service Request
            </Text>
          </View>
          <View className="w-8" />
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-5 py-8">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          How would you like to proceed?
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-10">
          Choose the best option for your needs
        </Text>

        {/* Open Request Card */}
        <TouchableOpacity
          onPress={handleOpenRequest}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 mb-4 border-2 border-primary-500 shadow-md active:scale-[0.98]"
        >
          <View className="flex-row items-start mb-3">
            <View className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-4">
              <Ionicons name="megaphone-outline" size={28} color="#2DA9E9" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Post Open Request
              </Text>
              <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                Recommended
              </Text>
            </View>
          </View>
          <Text className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-6">
            Describe what you need and let multiple service providers bid on your request. 
            Compare offers and choose the best one for you.
          </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Get multiple quotes to compare
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Negotiate the best price
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              More providers to choose from
            </Text>
          </View>
        </TouchableOpacity>

        {/* Direct Request Card */}
        <TouchableOpacity
          onPress={handleDirectRequest}
          className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-gray-200 dark:border-[#334155] shadow-sm active:scale-[0.98]"
        >
          <View className="flex-row items-start mb-3">
            <View className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
              <Ionicons name="person-outline" size={28} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Find a Specific Provider
              </Text>
            </View>
          </View>
          <Text className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-6">
            Already know who you want? Browse our providers and send a direct service request 
            to a specific provider you trust.
          </Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Choose your preferred provider
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Faster response time
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              Work with someone you know
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
