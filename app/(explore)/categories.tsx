import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequests } from '@/src/utils/apiRequests';
import SvgIcon from '@/src/componets/common/SvgIcon';

interface Category {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  sort_order: number;
  group_id: string;
  service_count: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { group_id, group_name } = useLocalSearchParams<{
    group_id: string;
    group_name: string;
  }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequests.get(`/client/groups/${group_id}/categories`);
      if (res.data.success) {
        const sorted = [...(res.data.data as Category[])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        setCategories(sorted);
      } else {
        setError(res.data.message || 'Failed to load categories');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load categories. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [group_id]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const onRefresh = () => { setRefreshing(true); fetchCategories(); };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
              {group_name}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Pick a specific service category
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/home')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="ml-3"
          >
            <Ionicons name="home-outline" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-400 mt-3 text-sm">Loading categories...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-gray-600 text-center mb-3">{error}</Text>
          <TouchableOpacity
            onPress={fetchCategories}
            className="bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(explore)/services',
                  params: { category_id: item.id, category_name: item.name },
                })
              }
              activeOpacity={0.8}
              className="bg-white rounded-2xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
            >
              <View className="flex-row items-center p-4">
                <View className="w-14 h-14 rounded-xl bg-orange-50 items-center justify-center mr-4 flex-shrink-0">
                  <SvgIcon uri={item.icon_url} size={36} fallback="🗂️" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <View className="bg-blue-50 rounded-full px-2 py-0.5">
                      <Text className="text-xs text-primary-600 font-medium">
                        {item.service_count} service{item.service_count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" className="ml-2" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-5xl mb-3">📂</Text>
              <Text className="text-gray-500 font-medium text-center">
                No categories found for this service
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
