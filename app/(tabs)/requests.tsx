import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setRequests } from '../../src/store/slices/requestsSlice';
import { formatCurrency, formatRelativeTime } from '../../src/utils/formatters';
import { apiRequests } from '@/src/utils/apiRequests';

export default function RequestsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const requests = useAppSelector((state) => state.requests.requests);
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await apiRequests.get('/client/requests');
      if (response.data.success) {
        dispatch(setRequests(response.data.data));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const activeRequests = requests.filter(
    (r) => r.status !== 'closed' && r.status !== 'cancelled'
  );

  const closedRequests = requests.filter(
    (r) => r.status === 'closed' || r.status === 'cancelled'
  );

  const displayedRequests = activeTab === 'active' ? activeRequests : closedRequests;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">My Requests</Text>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'active' ? 'bg-white' : ''
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'active' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Active ({activeRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('closed')}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === 'closed' ? 'bg-white' : ''
            }`}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === 'closed' ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              Closed ({closedRequests.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {displayedRequests.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-gray-600 text-center">
              {activeTab === 'active' ? 'No active requests' : 'No closed requests'}
            </Text>
            {activeTab === 'active' && (
              <TouchableOpacity
                onPress={() => router.push('/(service-request)/create/step1')}
                className="bg-primary-500 px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-semibold">Create Request</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayedRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              onPress={() => router.push(`/(service-request)/${request.id}`)}
              className="bg-gray-50 rounded-xl p-4 mb-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="flex-1 font-semibold text-gray-900 text-base" numberOfLines={2}>
                  {request.title}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ml-2 ${
                    request.status === 'awaiting_bids'
                      ? 'bg-yellow-100'
                      : request.status === 'bids_received'
                      ? 'bg-blue-100'
                      : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      request.status === 'awaiting_bids'
                        ? 'text-yellow-800'
                        : request.status === 'bids_received'
                        ? 'text-blue-800'
                        : 'text-gray-800'
                    }`}
                  >
                    {request.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 mb-2" numberOfLines={2}>
                {request.description}
              </Text>

              <View className="flex-row items-center mb-2">
                <Text className="text-primary-500 font-semibold mr-4">
                  {formatCurrency(request.budget)}
                </Text>
                <Text className="text-gray-500 text-xs">📍 {request.location.city}</Text>
              </View>

              {request.bidsCount > 0 && (
                <View className="bg-primary-50 px-3 py-2 rounded-lg">
                  <Text className="text-primary-700 font-semibold text-sm">
                    {request.bidsCount} {request.bidsCount === 1 ? 'Bid' : 'Bids'} Received
                  </Text>
                </View>
              )}

              <Text className="text-gray-400 text-xs mt-2">
                {formatRelativeTime(request.createdAt)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(service-request)/create/step1')}
        className="absolute bottom-6 right-6 bg-primary-500 w-16 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
