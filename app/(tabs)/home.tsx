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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dashboardSummary = useAppSelector((state) => state.dashboard.summary);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

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
    if (isAuthenticated) {
      await Promise.all([loadDashboard(), fetchUnreadCount()]);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                Hello, {isAuthenticated ? (user?.fullName || 'there') : 'Guest'}!
              </Text>
              <Text className="text-gray-600">
                {isAuthenticated ? 'Welcome back to your dashboard' : 'Find services near you'}
              </Text>
            </View>
            {isAuthenticated && (
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
            )}
          </View>
        </View>

        {/* Guest Sign-In Banner */}
        {!isAuthenticated && (
          <View className="mx-6 mt-4 mb-2 rounded-2xl overflow-hidden border border-blue-100">
            <View className="px-5 py-4 flex-row items-center" style={{ backgroundColor: '#EFF8FF' }}>
              <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#2DA9E9" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800 text-sm mb-0.5">Sign in for full access</Text>
                <Text className="text-gray-500 text-xs">Track bookings, requests & more</Text>
              </View>
              <View className="flex-row gap-2 ml-2">
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  className="px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: '#2DA9E9' }}
                >
                  <Text className="text-white text-xs font-bold">Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white"
                >
                  <Text className="text-gray-700 text-xs font-bold">Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

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

        {/* Authenticated: Dashboard Summary Cards */}
        {isAuthenticated && (
          <>
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

            {/* Quick Navigation */}
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
              </View>
            </View>
          </>
        )}

        {/* Guest: Feature Highlights */}
        {!isAuthenticated && (
          <View className="px-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">What You Can Do</Text>
            <View className="space-y-3">
              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100">
                <Text className="text-2xl mr-3">🔍</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Browse Providers</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">Search across all service categories</Text>
                </View>
                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                  <Text className="text-green-700 text-[10px] font-bold">FREE</Text>
                </View>
              </View>
              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100">
                <Text className="text-2xl mr-3">📋</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Post Requests</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">Get bids from multiple providers</Text>
                </View>
                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                  <Text className="text-blue-700 text-[10px] font-bold">SIGN IN</Text>
                </View>
              </View>
              <View className="bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100">
                <Text className="text-2xl mr-3">📅</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">Book Services</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">Secure bookings with safe payments</Text>
                </View>
                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                  <Text className="text-blue-700 text-[10px] font-bold">SIGN IN</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Help Section */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={() => router.push('/(account)/help')}
            className="rounded-xl p-6 shadow-sm"
            style={{ backgroundColor: '#2DA9E9' }}
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
              <Text className="font-semibold" style={{ color: '#2DA9E9' }}>Contact Support</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
