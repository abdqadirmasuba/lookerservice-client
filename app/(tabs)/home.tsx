import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setCategories } from '../../src/store/slices/categoriesSlice';
import { setFeaturedProviders } from '../../src/store/slices/providersSlice';
import { getAllCategories } from '../../src/services/categories.service';
import { getFeaturedProviders } from '../../src/services/providers.service';
import { DEFAULT_CATEGORIES } from '../../src/utils/constants';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const categories = useAppSelector((state) => state.categories.categories);
  const featuredProviders = useAppSelector((state) => state.providers.featuredProviders);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const categoriesResponse = await getAllCategories();
      if (categoriesResponse.success) {
        dispatch(setCategories(categoriesResponse.data));
      } else {
        dispatch(setCategories(DEFAULT_CATEGORIES));
      }

      // Load featured providers
      const providersResponse = await getFeaturedProviders();
      if (providersResponse.success) {
        dispatch(setFeaturedProviders(providersResponse.data));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch(setCategories(DEFAULT_CATEGORIES));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Hello, {user?.fullName || 'Guest'}!
          </Text>
          <Text className="text-gray-600">What service do you need today?</Text>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <TextInput
              className="flex-1 text-base"
              placeholder="Search for services..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => router.push('/search/results')}
            />
          </View>
        </View>

        {/* Post Request CTA */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/(service-request)/create/step1')}
            className="bg-primary-500 py-5 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">Post a Service Request</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Categories</Text>
          <View className="flex-row flex-wrap -mx-2">
            {categories.slice(0, 8).map((category) => (
              <View key={category.id} className="w-1/4 px-2 mb-4">
                <TouchableOpacity
                  onPress={() => router.push('/explore')}
                  className="bg-gray-50 rounded-xl p-4 items-center"
                >
                  <Text className="text-3xl mb-2">{category.icon}</Text>
                  <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Providers */}
        {featuredProviders.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Featured Providers</Text>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text className="text-primary-500 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {featuredProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  onPress={() => router.push(`/(providers)/${provider.id}/profile`)}
                  className="bg-gray-50 rounded-xl p-4 mr-4 w-64"
                >
                  <View className="bg-gray-300 h-32 rounded-lg mb-3" />
                  <Text className="font-semibold text-gray-900 mb-1" numberOfLines={1}>
                    {provider.businessName}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    ⭐ {provider.rating.toFixed(1)} ({provider.reviewsCount} reviews)
                  </Text>
                  <Text className="text-xs text-gray-500">{provider.location.city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Help Section */}
        <View className="px-6 mb-8">
          <View className="bg-blue-50 rounded-xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Need Help?</Text>
            <Text className="text-gray-600 mb-4">Contact our support team anytime</Text>
            <TouchableOpacity className="bg-primary-500 py-3 rounded-lg items-center">
              <Text className="text-white font-semibold">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
