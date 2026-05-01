import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setDashboardSummary, setDashboardLoading, setDashboardError } from '../../src/store/slices/dashboardSlice';
import { setUnreadCount } from '../../src/store/slices/notificationsSlice';
import { apiRequests } from '@/src/utils/apiRequests';


export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const dashboardSummary = useAppSelector((state) => state.dashboard.summary);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiRequests.get('/notifications/count');
      if (res.data.success) {
        dispatch(setUnreadCount(res.data.data.unread_count));
      }
    } catch {
      // silent — badge simply won't show
    }
  };

  const loadDashboard = async () => {
    try {
      dispatch(setDashboardLoading(true));
      const response = await apiRequests.get('/client/dashboard/summary');
      if (response.data.success) {
        dispatch(setDashboardSummary(response.data.data));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      dispatch(setDashboardError('Failed to load dashboard'));
    } finally {
      dispatch(setDashboardLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), fetchUnreadCount()]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Notifications */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                Hello, {user?.fullName || 'Guest'}!
              </Text>
              <Text className="text-gray-600">Welcome back to your dashboard</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/notifications-list')}
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center relative"
            >
              <Ionicons name="notifications-outline" size={24} color="#1F2937" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Call to Action — Find a Service */}
        <View className="px-6 pt-4 pb-6 bg-white mb-4">
          <TouchableOpacity
            onPress={() => router.push('/(explore)/explore')}
            activeOpacity={0.85}
            className="rounded-2xl overflow-hidden"
          >
            <View
              className="py-5 px-6 flex-row items-center"
              style={{ backgroundColor: '#F57C1F' }}
            >
              <View className="flex-1">
                <Text className="text-white font-bold text-lg">Find a Service</Text>
                <Text className="text-white/80 text-sm mt-0.5">
                  Browse providers across 18+ service types
                </Text>
              </View>
              <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center ml-4">
                <Text className="text-2xl">🔍</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Dashboard Summary Cards */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-blue-50 rounded-xl p-4">
              <Text className="text-3xl font-bold text-blue-600 mb-1">
                {dashboardSummary?.active_requests_count || 0}
              </Text>
              <Text className="text-gray-700 font-medium">Active Requests</Text>
            </View>
            <View className="flex-1 rounded-xl p-4" style={{ backgroundColor: '#FFF7ED' }}>
              <Text className="text-3xl font-bold mb-1" style={{ color: '#F57C1F' }}>
                {dashboardSummary?.active_bookings_count || 0}
              </Text>
              <Text className="text-gray-700 font-medium">Active Bookings</Text>
            </View>
          </View>
        </View>

        {/* Active Requests Section */}
        {dashboardSummary && dashboardSummary.active_requests_count > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Active Requests</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/requests')}>
                <Text className="text-primary-500 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            {/* {dashboardSummary.active_requests.map((request) => (
              <TouchableOpacity
                key={request.id}
                onPress={() => router.push(`/(service-request)/${request.id}`)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-sm font-semibold text-gray-500">
                    {request.request_number}
                  </Text>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-blue-700 capitalize">
                      {request.status}
                    </Text>
                  </View>
                </View>
                <Text className="font-bold text-gray-900 mb-2" numberOfLines={2}>
                  {request.title}
                </Text>
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs text-gray-600">
                      {request.request_type === 'direct' ? '📍 Direct Request' : '📢 Open Request'}
                    </Text>
                    {request.target_provider_name && (
                      <Text className="text-xs text-gray-600 mt-1">
                        To: {request.target_provider_name}
                      </Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-500">{formatDate(request.created_at)}</Text>
                    <Text className="text-xs text-gray-600 mt-1">
                      {request.bid_count} {request.bid_count === 1 ? 'bid' : 'bids'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))} */}
          </View>
        )}

        {/* Active Bookings Section */}
        {dashboardSummary && dashboardSummary.active_bookings_count > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">Active Bookings</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
                <Text className="text-primary-500 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            {/* {dashboardSummary.active_bookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                onPress={() => router.push(`/(bookings)/${booking.id}`)}
                className="bg-white rounded-xl p-4 mb-3 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-sm font-semibold text-gray-500">
                    {booking.booking_number}
                  </Text>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-green-700 capitalize">
                      {booking.status}
                    </Text>
                  </View>
                </View>
                <Text className="font-bold text-gray-900 mb-2" numberOfLines={2}>
                  {booking.service_title}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">
                    👤 {booking.provider_name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatDate(booking.scheduled_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))} */}
          </View>
        )}

        {/* Quick Navigation Cards */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
          <View className="space-y-3">
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/requests')}
              className="bg-white rounded-xl p-5 shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">📋</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">My Requests</Text>
                <Text className="text-gray-600 text-sm">View all your service requests</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/bookings')}
              className="bg-white rounded-xl p-5 shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">📅</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">My Bookings</Text>
                <Text className="text-gray-600 text-sm">Manage your active bookings</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(explore)/explore')}
              className="bg-white rounded-xl p-5 shadow-sm flex-row items-center"
            >
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: '#FFF7ED' }}>
                <Text className="text-2xl">🔍</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">Find a Service</Text>
                <Text className="text-gray-600 text-sm">Browse providers near you</Text>
              </View>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help Section */}
        <View className="px-6 mb-8">
          <TouchableOpacity 
            onPress={() => router.push('/(account)/help')}
            className="bg-gradient-to-br bg-blue-500 rounded-xl p-6 shadow-sm"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">💬</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">Need Help?</Text>
                <Text className="text-blue-100 text-sm">Contact our support team anytime</Text>
              </View>
            </View>
            <View className="bg-white rounded-lg py-3 items-center">
              <Text className="text-blue-600 font-semibold">Contact Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
