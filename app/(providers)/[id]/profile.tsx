import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequests } from '@/src/utils/apiRequests';
import LocationMapModal from '@/src/componets/modals/LocationMapModal';
import type { ProviderDetailsResponse } from '@/src/types';

const BLUE = '#2DA9E9';
const ORANGE = '#F57C1F';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const DELIVERY_LABELS: Record<string, { label: string; icon: string }> = {
  both: { label: 'In-person & Remote', icon: 'swap-horizontal-outline' },
  in_person: { label: 'In-person only', icon: 'walk-outline' },
  remote: { label: 'Remote only', icon: 'globe-outline' },
  online: { label: 'Online only', icon: 'globe-outline' },
};

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [provider, setProvider] = useState<ProviderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadProvider();
  }, [id]);

  const loadProvider = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequests.get(`/client/providers/${id}`);
      if (res.data.success) {
        setProvider(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load provider');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load provider details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLocation = () => {
    if (provider?.location) {
      setShowMap(true);
    } else {
      Alert.alert('Location Unavailable', 'This provider has not set their location.');
    }
  };

  const handleRequestService = () => {
    router.push(`/(providers)/${id}/request`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-[17px] font-bold text-gray-900">Provider Profile</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BLUE} />
          <Text className="text-gray-400 mt-3 text-sm">Loading provider details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-[17px] font-bold text-gray-900">Provider Profile</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🔍</Text>
          <Text className="text-gray-700 font-semibold text-center text-lg mb-2">Provider Not Found</Text>
          <Text className="text-gray-500 text-center mb-6">
            {error || 'Unable to load provider details'}
          </Text>
          <TouchableOpacity
            onPress={loadProvider}
            className="bg-primary-500 px-8 py-3 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = provider.business_name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  const isVerified = provider.verification_status === 'approved';
  const deliveryMeta = DELIVERY_LABELS[provider.service_delivery_type] ?? {
    label: provider.service_delivery_type,
    icon: 'ellipsis-horizontal-outline',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="auto" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-gray-900">Provider Profile</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero Card ────────────────────────────────────────────── */}
        <View className="bg-white mx-4 mt-4 rounded-2xl border border-gray-100 overflow-hidden">
          {/* Blue accent stripe */}
          <View className="h-2 bg-primary-500" />

          <View className="px-5 py-5">
            <View className="flex-row items-start">
              {/* Avatar */}
              <View className="w-[68px] h-[68px] rounded-2xl bg-primary-50 border-2 border-primary-200 items-center justify-center mr-4">
                <Text className="text-primary-600 font-extrabold text-2xl">{initials}</Text>
              </View>

              {/* Name + badges */}
              <View className="flex-1">
                <Text className="text-lg font-extrabold text-gray-900 mb-1.5" numberOfLines={2}>
                  {provider.business_name}
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {isVerified && (
                    <View className="flex-row items-center bg-green-50 border border-green-200 px-2 py-0.5 rounded-full gap-1">
                      <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                      <Text className="text-green-700 text-[11px] font-bold">Verified</Text>
                    </View>
                  )}
                  {provider.service_delivery_type && (
                    <View className="flex-row items-center bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full gap-1">
                      <Ionicons name={deliveryMeta.icon as any} size={11} color={BLUE} />
                      <Text className="text-primary-600 text-[11px] font-semibold">{deliveryMeta.label}</Text>
                    </View>
                  )}
                  <View className="flex-row items-center bg-gray-100 px-2 py-0.5 rounded-full gap-1">
                    <Ionicons name="calendar-outline" size={11} color="#6B7280" />
                    <Text className="text-gray-500 text-[11px]">
                      Since {new Date(provider.member_since).getFullYear()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Stats row */}
            <View className="flex-row mt-4 gap-3">
              <View className="flex-1 bg-gray-50 rounded-xl p-3 border-l-4 border-yellow-400">
                <Text className="text-xl font-extrabold text-gray-900">
                  {provider.rating_summary.average_rating.toFixed(1)}
                </Text>
                <Text className="text-[11px] text-gray-500 mt-0.5">Rating</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl p-3 border-l-4 border-primary-400">
                <Text className="text-xl font-extrabold text-gray-900">{provider.total_bookings}</Text>
                <Text className="text-[11px] text-gray-500 mt-0.5">Bookings</Text>
              </View>
              <View className="flex-1 bg-gray-50 rounded-xl p-3 border-l-4 border-tertiary-400">
                <Text className="text-xl font-extrabold text-gray-900">
                  {provider.rating_summary.total_reviews}
                </Text>
                <Text className="text-[11px] text-gray-500 mt-0.5">Reviews</Text>
              </View>
            </View>

            {/* Description */}
            {provider.business_description && (
              <View className="mt-4 pt-4 border-t border-gray-100">
                <Text className="text-gray-600 text-sm leading-5">{provider.business_description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Location ─────────────────────────────────────────────── */}
        <View className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 px-5 py-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2.5">
              <Ionicons name="location-outline" size={16} color={BLUE} />
            </View>
            <Text className="text-base font-bold text-gray-900">Location</Text>
          </View>
          <Text className="text-gray-800 font-medium mb-0.5">{provider.address}</Text>
          <Text className="text-sm text-gray-500">
            {[provider.city, provider.state_region, provider.country].filter(Boolean).join(', ')}
          </Text>
          <TouchableOpacity
            onPress={handleViewLocation}
            className="mt-3 bg-primary-50 border border-primary-200 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5"
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={16} color={BLUE} />
            <Text className="text-primary-600 font-semibold text-sm">View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* ── Contact ──────────────────────────────────────────────── */}
        <View className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 px-5 py-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-2.5">
              <Ionicons name="person-outline" size={16} color={ORANGE} />
            </View>
            <Text className="text-base font-bold text-gray-900">Contact</Text>
          </View>
          <View className="gap-2">
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm w-14">Name</Text>
              <Text className="text-gray-800 font-medium flex-1">{provider.contact_info.full_name}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm w-14">Email</Text>
              <Text className="text-primary-600 flex-1" numberOfLines={1}>{provider.contact_info.email}</Text>
            </View>
          </View>
        </View>

        {/* ── Business Hours ────────────────────────────────────────── */}
        {provider.business_hours && provider.business_hours.length > 0 && (
          <View className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 px-5 py-4">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-green-50 items-center justify-center mr-2.5">
                <Ionicons name="time-outline" size={16} color="#16A34A" />
              </View>
              <Text className="text-base font-bold text-gray-900">Business Hours</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {provider.business_hours.map((h) => {
                const isOpen = h.status === 'open';
                return (
                  <View
                    key={h.day}
                    className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${
                      isOpen ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isOpen ? 'text-green-700' : 'text-gray-400'}`}>
                      {DAY_LABELS[h.day] ?? h.day}
                    </Text>
                    {isOpen && (
                      <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Reviews ──────────────────────────────────────────────── */}
        <View className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 px-5 py-4">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-full bg-yellow-50 items-center justify-center mr-2.5">
              <Ionicons name="star-outline" size={16} color="#D97706" />
            </View>
            <Text className="text-base font-bold text-gray-900">Reviews</Text>
          </View>
          {provider.reviews && provider.reviews.length > 0 ? (
            <Text className="text-gray-500 text-sm">Reviews will be displayed here.</Text>
          ) : (
            <Text className="text-gray-400 text-sm">
              No reviews yet. Be the first to review this provider!
            </Text>
          )}
        </View>

      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4">
        <TouchableOpacity
          onPress={handleRequestService}
          className="bg-tertiary-500 py-4 rounded-2xl items-center flex-row justify-center gap-2"
          activeOpacity={0.85}
        >
          <Ionicons name="send-outline" size={18} color="#fff" />
          <Text className="text-white font-bold text-base">Request This Provider</Text>
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      {provider.location && (
        <LocationMapModal
          visible={showMap}
          onClose={() => setShowMap(false)}
          latitude={provider.location.latitude}
          longitude={provider.location.longitude}
          title={provider.business_name}
          address={`${provider.address}, ${provider.city}`}
        />
      )}
    </SafeAreaView>
  );
}
