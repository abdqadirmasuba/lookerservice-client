import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { setBookings } from '../../src/store/slices/bookingsSlice';
import { getMyBookings } from '../../src/services/bookings.service';
import { formatDateTime, formatCurrency } from '../../src/utils/formatters';

export default function BookingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.bookings.bookings);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await getMyBookings();
      if (response.success) {
        dispatch(setBookings(response.data));
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">My Bookings</Text>
        <Text className="text-gray-600">Track your service bookings</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {bookings.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">📅</Text>
            <Text className="text-gray-600 text-center mb-4">No bookings yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/explore')}
              className="bg-primary-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold">Explore Providers</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              onPress={() => router.push(`/(bookings)/${booking.id}`)}
              className="bg-gray-50 rounded-xl p-4 mb-4"
            >
              <View className="flex-row items-start mb-3">
                <View className="bg-gray-300 w-16 h-16 rounded-lg mr-3" />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">
                    {booking.provider.businessName}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">{booking.service.name}</Text>
                  <View
                    className={`self-start px-3 py-1 rounded-full ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100'
                        : booking.status === 'in_progress'
                        ? 'bg-blue-100'
                        : booking.status === 'completed'
                        ? 'bg-gray-200'
                        : 'bg-red-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'text-green-800'
                          : booking.status === 'in_progress'
                          ? 'text-blue-800'
                          : booking.status === 'completed'
                          ? 'text-gray-800'
                          : 'text-red-800'
                      }`}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="border-t border-gray-200 pt-3">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 text-sm">📅 {formatDateTime(booking.scheduledDate)}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 text-sm">
                    📍 {booking.location.city}
                  </Text>
                  <Text className="text-primary-500 font-semibold">
                    {formatCurrency(booking.totalAmount)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
