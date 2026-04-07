import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setRequests, appendRequests, setRequestsLoading, resetPagination } from '../../src/store/slices/requestsSlice';
import { formatCurrency, formatRelativeTime } from '../../src/utils/formatters';
import { apiRequests } from '@/src/utils/apiRequests';

export default function RequestsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { requests, isLoading, hasMore, offset, limit } = useAppSelector((state) => state.requests);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadRequests(true);
  }, []);

  const loadRequests = async (reset: boolean = false) => {
    try {
      if (reset) {
        dispatch(setRequestsLoading(true));
        dispatch(resetPagination());
      }

      const currentOffset = reset ? 0 : offset;
      const response = await apiRequests.get(`/client/service-requests?limit=${limit}&offset=${currentOffset}`);
      
      if (response.data.success) {
        if (reset) {
          dispatch(setRequests(response.data.data));
        } else {
          dispatch(appendRequests(response.data.data));
        }
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      dispatch(setRequestsLoading(false));
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || isLoading) return;
    
    setLoadingMore(true);
    await loadRequests(false);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests(true);
    setRefreshing(false);
  };

  const activeRequests = requests.filter(
    (r) => r.status !== 'closed' && r.status !== 'cancelled'
  );

  const closedRequests = requests.filter(
    (r) => r.status === 'closed' || r.status === 'cancelled'
  );

  const displayedRequests = activeTab === 'active' ? activeRequests : closedRequests;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' };
      case 'in_progress':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' };
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' };
      case 'cancelled':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' };
    }
  };

  const getRequestTypeIcon = (type: string) => {
    return type === 'direct' ? '👤' : '📢';
  };

  const getRequestTypeName = (type: string) => {
    return type === 'direct' ? 'Direct' : 'Open';
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Requests</Text>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 dark:bg-[#1E293B] rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'active' ? 'bg-white dark:bg-[#0F172A]' : ''
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'active' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Active ({activeRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('closed')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'closed' ? 'bg-white dark:bg-[#0F172A]' : ''
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'closed' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Closed ({closedRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && displayedRequests.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Loading requests...
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {displayedRequests.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-6xl mb-4">📋</Text>
              <Text className="text-gray-600 dark:text-gray-400 text-center">
                {activeTab === 'active' ? 'No active requests' : 'No closed requests'}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/explore')}
                  className="bg-primary-500 px-6 py-3 rounded-lg mt-4"
                >
                  <Text className="text-white font-semibold">Create Request</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {displayedRequests.map((request) => {
                const statusColor = getStatusColor(request.status);
                return (
                  <TouchableOpacity
                    key={request.id}
                    onPress={() => router.push(`/(service-request)/${request.id}`)}
                    className="bg-gray-50 dark:bg-[#1E293B] rounded-xl p-4 mb-4 border border-gray-100 dark:border-[#334155]"
                    activeOpacity={0.7}
                  >
                    {/* Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-lg mr-2">{getRequestTypeIcon(request.request_type)}</Text>
                          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {getRequestTypeName(request.request_type)}
                          </Text>
                        </View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {request.request_number}
                        </Text>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                        <Text className={`text-xs font-medium ${statusColor.text}`}>
                          {request.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text className="text-gray-900 dark:text-white font-medium mb-2" numberOfLines={2}>
                      {request.description}
                    </Text>

                    {/* Services */}
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {request.services.slice(0, 2).map((service) => (
                        <View key={service.id} className="bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                          <Text className="text-primary-700 dark:text-primary-300 text-xs font-medium">
                            {service.service_name}
                          </Text>
                        </View>
                      ))}
                      {request.services.length > 2 && (
                        <View className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                            +{request.services.length - 2} more
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Budget & Location */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mr-3">📍 {request.city}</Text>
                        {(request.budget_min || request.budget_max) && (
                          <Text className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                            {request.budget_min && request.budget_max
                              ? `${formatCurrency(request.budget_min)} - ${formatCurrency(request.budget_max)}`
                              : request.budget_min
                              ? `From ${formatCurrency(request.budget_min)}`
                              : `Up to ${formatCurrency(request.budget_max)}`}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Footer */}
                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-[#334155]">
                      <Text className="text-gray-400 dark:text-gray-500 text-xs">
                        {formatRelativeTime(request.created_at)}
                      </Text>
                      {request.bid_count > 0 && (
                        <View className="flex-row items-center">
                          <Text className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                            {request.bid_count} {request.bid_count === 1 ? 'Bid' : 'Bids'}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Load More Button */}
              {hasMore && !isLoading && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-gray-100 dark:bg-[#1E293B] py-4 rounded-xl items-center mb-4 border border-gray-200 dark:border-[#334155]"
                  activeOpacity={0.7}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#2DA9E9" />
                  ) : (
                    <Text className="text-gray-600 dark:text-gray-400 font-semibold">
                      Load More
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <View className="h-20" />
            </>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/explore')}
        className="absolute bottom-6 right-6 bg-primary-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
