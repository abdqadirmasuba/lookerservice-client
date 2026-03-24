import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { setSelectedBooking } from '../../src/store/slices/bookingsSlice';
import { formatDate } from '../../src/utils/formatters';
import { apiRequests } from '@/src/utils/apiRequests';
import type { Booking, BookingStatusString } from '../../src/types/booking.types';

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-50">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-800 flex-1 text-right ml-4">{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cached = useAppSelector((state) =>
    state.bookings.bookings.find((b) => b.id === id),
  );

  const [booking, setBooking] = useState<Booking | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) {
      dispatch(setSelectedBooking(cached));
      return;
    }
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequests.get(`/client/bookings/${id}`);
      if (response.data.success) {
        const data: Booking = response.data.data;
        setBooking(data);
        dispatch(setSelectedBooking(data));
      } else {
        setError('Booking not found.');
      }
    } catch {
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</Text>
        <Text className="text-sm text-gray-400 text-center mb-6">{error ?? 'Booking not found.'}</Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-indigo-500 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const s = statusStyle(booking.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-2xl text-gray-600">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">Booking Details</Text>
          <Text className="text-xs text-gray-400">{booking.booking_number}</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${s.bg}`}>
          <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Provider card */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
          <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Provider</Text>
          <Text className="text-base font-bold text-gray-900">{booking.business_name}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{booking.provider_name}</Text>
          {booking.provider_phone && (
            <Text className="text-sm text-indigo-600 mt-1">📞 {booking.provider_phone}</Text>
          )}
        </View>

        {/* Booking info */}
        <View className="bg-white rounded-2xl px-4 mb-4 border border-gray-100">
          <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide pt-4 mb-1">
            Booking Info
          </Text>
          <DetailRow label="Date" value={formatDate(booking.booking_date, 'long')} />
          <DetailRow label="Booking #" value={booking.booking_number} />
          {booking.agreed_amount != null && (
            <DetailRow
              label="Agreed Amount"
              value={`UGX ${Number(booking.agreed_amount).toLocaleString()}`}
            />
          )}
          {booking.payment_method.payment_method && (
            <DetailRow label="Payment Method" value={booking.payment_method.payment_method} />
          )}
          <DetailRow label="Created" value={formatDate(booking.created_at)} />
        </View>

        {/* Services */}
        {booking.services.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
              Services
            </Text>
            {booking.services.map((svc) => (
              <View key={svc.id} className="flex-row items-center py-2 border-b border-gray-50 last:border-0">
                <View className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-3" />
                <Text className="text-sm text-gray-700">{svc.title}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Client notes */}
        {booking.client_notes && (
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
            <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              Notes
            </Text>
            <Text className="text-sm text-gray-700 leading-5">{booking.client_notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

