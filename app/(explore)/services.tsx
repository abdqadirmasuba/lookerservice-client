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

interface Service {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  sort_order: number;
}

export default function ServicesScreen() {
  const router = useRouter();
  const { category_id, category_name } = useLocalSearchParams<{
    category_id: string;
    category_name: string;
  }>();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequests.get(`/client/categories/${category_id}/services`);
      if (res.data.success) {
        const sorted = [...(res.data.data as Service[])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        setServices(sorted);
      } else {
        setError(res.data.message || 'Failed to load services');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load services. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [category_id]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const onRefresh = () => { setRefreshing(true); fetchServices(); };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
              {category_name}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Select the specific service you need
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
          <Text className="text-gray-400 mt-3 text-sm">Loading services...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-gray-600 text-center mb-3">{error}</Text>
          <TouchableOpacity
            onPress={fetchServices}
            className="bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(explore)/providers',
                  params: { service_id: item.id, service_name: item.name },
                })
              }
              activeOpacity={0.8}
              className="bg-white rounded-2xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
            >
              <View className="flex-row items-center p-4">
                <View
                  className="w-14 h-14 rounded-xl items-center justify-center mr-4 flex-shrink-0"
                  style={{ backgroundColor: '#FFF7ED' }}
                >
                  <SvgIcon uri={item.icon_url} size={36} fallback="⚙️" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
                <View
                  className="ml-3 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: '#F57C1F' }}
                >
                  <Text className="text-white text-xs font-semibold">Find</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-5xl mb-3">🛠️</Text>
              <Text className="text-gray-500 font-medium text-center">
                No services available in this category
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
