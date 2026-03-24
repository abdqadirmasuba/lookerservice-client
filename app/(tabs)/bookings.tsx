import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import {
  setBookings,
  appendBookings,
  setBookingsLoading,
  setBookingsLoadingMore,
  setBookingsError,
  resetBookings,
} from '../../src/store/slices/bookingsSlice';
import { formatDate } from '../../src/utils/formatters';
import { apiRequests } from '@/src/utils/apiRequests';
import type { Booking, BookingStatusString } from '../../src/types/booking.types';

const LIMIT = 20;

const STATUS_STYLES: Record<BookingStatusString, { bg: string; text: string; label: string }> = {
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Pending' },
  accepted:    { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Accepted' },
  confirmed:   { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Confirmed' },
  in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'In Progress' },
  completed:   { bg: 'bg-gray-200',   text: 'text-gray-700',   label: 'Completed' },
  cancelled:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Cancelled' },
};

function statusStyle(status: string) {
  return (
    STATUS_STYLES[status as BookingStatusString] ?? {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      label: status,
    }
  );
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const s = statusStyle(booking.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 shadow-sm"
    >
      {/* Header: booking number + status badge */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs text-gray-400 font-medium">{booking.booking_number}</Text>
        <View className={`px-3 py-1 rounded-full ${s.bg}`}>
          <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
        </View>
      </View>

      {/* Business name */}
      <Text className="text-base font-bold text-gray-900 mb-0.5">{booking.business_name}</Text>
      <Text className="text-sm text-gray-500 mb-2">{booking.provider_name}</Text>

      {/* Services list */}
      {booking.services.length > 0 && (
        <Text className="text-sm text-gray-600 mb-2" numberOfLines={1}>
          {booking.services.map((svc) => svc.title).join(' · ')}
        </Text>
      )}

      {/* Footer: date + amount */}
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
        <Text className="text-xs text-gray-400">
          📅 {formatDate(booking.booking_date)}
        </Text>
        {booking.agreed_amount != null && (
          <Text className="text-sm font-semibold text-gray-800">
            UGX {Number(booking.agreed_amount).toLocaleString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { bookings, isLoading, isLoadingMore, hasMore, offset, error } = useAppSelector(
    (state) => state.bookings,
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = useCallback(
    async (currentOffset: number, replace: boolean) => {
      try {
        if (replace) dispatch(setBookingsLoading(true));
        else dispatch(setBookingsLoadingMore(true));

        const response = await apiRequests.get('/client/bookings', {
          limit: LIMIT,
          offset: currentOffset,
        });

        if (response.data.success) {
          const data: Booking[] = response.data.data;
          if (replace) dispatch(setBookings(data));
          else dispatch(appendBookings(data));
        }
      } catch {
        dispatch(setBookingsError('Failed to load bookings. Pull down to retry.'));
      } finally {
        dispatch(setBookingsLoading(false));
        dispatch(setBookingsLoadingMore(false));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(resetBookings());
    fetchBookings(0, true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(resetBookings());
    await fetchBookings(0, true);
    setRefreshing(false);
  };

  const onLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchBookings(offset, false);
    }
  };

  if (isLoading && bookings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-3 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
        <Text className="text-sm text-gray-500 mt-0.5">Track your service bookings</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => router.push(`/(bookings)/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center justify-center py-24">
              <Text className="text-5xl mb-4">📅</Text>
              <Text className="text-lg font-semibold text-gray-700 mb-1">No bookings yet</Text>
              <Text className="text-sm text-gray-400 text-center mb-6">
                Your bookings will appear here once providers accept your requests.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/explore')}
                className="bg-indigo-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">Explore Providers</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {error ? (
        <View className="absolute bottom-8 left-4 right-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Text className="text-red-700 text-sm text-center">{error}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
