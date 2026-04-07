import { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { apiRequests } from '@/src/utils/apiRequests';
import type { ProviderListItem } from '@/src/types';

const ORANGE = '#F57C1F';
const RANGE_OPTIONS = [
  { label: 'Any', value: null },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '15 km', value: 15 },
  { label: '25 km', value: 25 },
  { label: '50 km', value: 50 },
];
const SORT_OPTIONS = [
  { label: 'Nearest', value: 'distance' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Reviews', value: 'reviews' },
];

// ─── Map Picker Modal ─────────────────────────────────────────────────────────
function MapPickerModal({
  visible,
  initialLat,
  initialLng,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (visible) setPin({ lat: initialLat, lng: initialLng });
  }, [visible, initialLat, initialLng]);

  const initialRegion: Region = {
    latitude: initialLat || 0.3155,
    longitude: initialLng || 32.5822,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={onCancel} style={styles.mapHeaderBtn}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.mapHeaderTitle}>Pick Search Location</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.mapHint}>Tap anywhere on the map to set your search center</Text>

        <MapView
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          onPress={(e: MapPressEvent) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPin({ lat: latitude, lng: longitude });
          }}
        >
          <Marker
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            pinColor={ORANGE}
          />
        </MapView>

        {/* Confirm */}
        <TouchableOpacity
          onPress={() => onConfirm(pin.lat, pin.lng)}
          style={styles.mapConfirmBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.mapConfirmText}>Use This Location</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Provider Card ────────────────────────────────────────────────────────────
function ProviderCard({
  provider,
  onPress,
}: {
  provider: ProviderListItem;
  onPress: () => void;
}) {
  const initials = provider.business_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="bg-white rounded-2xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
    >
      <View className="flex-row items-center p-4">
        <View className="w-14 h-14 rounded-full bg-blue-50 items-center justify-center mr-4 flex-shrink-0">
          <Text className="text-primary-600 font-bold text-lg">{initials}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {provider.business_name}
          </Text>
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {provider.city}{provider.address ? `, ${provider.address}` : ''}
          </Text>
          <View className="flex-row items-center mt-1.5 flex-wrap gap-2">
            <View className="flex-row items-center">
              <Text className="text-yellow-400 text-xs">★</Text>
              <Text className="text-xs text-gray-700 font-medium ml-0.5">
                {provider.average_rating?.toFixed(1) ?? '0.0'}
              </Text>
              <Text className="text-xs text-gray-400 ml-1">
                ({provider.total_reviews ?? 0})
              </Text>
            </View>
            {provider.distance != null && provider.distance > 0 && (
              <Text className="text-xs text-gray-400">
                📍 {provider.distance < 1
                  ? `${(provider.distance * 1000).toFixed(0)} m`
                  : `${provider.distance.toFixed(1)} km`} away
              </Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
      {provider.business_description ? (
        <View className="px-4 pb-3 -mt-1">
          <Text className="text-sm text-gray-500" numberOfLines={2}>
            {provider.business_description}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        active && { backgroundColor: ORANGE, borderColor: ORANGE },
      ]}
    >
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProvidersScreen() {
  const router = useRouter();
  const { service_id, service_name } = useLocalSearchParams<{
    service_id: string;
    service_name: string;
  }>();

  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [rangeKm, setRangeKm] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string | null>('distance');
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Get device location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
      }
    })();
  }, []);

  const buildParams = useCallback(
    (page: number) => {
      const p: Record<string, any> = { limit: 20, page };
      if (latitude != null) p.latitude = latitude;
      if (longitude != null) p.longitude = longitude;
      if (rangeKm != null) p.range_km = rangeKm;
      if (sortBy) p.sort_by = sortBy;
      return p;
    },
    [latitude, longitude, rangeKm, sortBy],
  );

  const fetchProviders = useCallback(
    async (page = 1, append = false) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError('');
      try {
        const res = await apiRequests.get(
          `/client/services/${service_id}/providers`,
          buildParams(page),
        );
        if (res.data.success) {
          const data: ProviderListItem[] = res.data.data?.data ?? [];
          const pagination = res.data.data?.pagination ?? {};
          const perPage = pagination.per_page ?? 20;
          const currentPg = pagination.current_page ?? page;

          if (append) {
            setProviders((prev) => [...prev, ...data]);
          } else {
            setProviders(data);
          }
          setCurrentPage(currentPg);
          setHasMore(data.length === perPage);
          setTotal(data.length + (append ? providers.length : 0));
        } else {
          setError(res.data.message || 'Failed to load providers');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Could not load providers. Please try again.');
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [service_id, buildParams],
  );

  // Re-fetch when filters change
  useEffect(() => {
    fetchProviders(1, false);
  }, [fetchProviders]);

  const onRefresh = () => { setRefreshing(true); fetchProviders(1, false); };
  const loadMore = () => {
    if (!isLoadingMore && hasMore) fetchProviders(currentPage + 1, true);
  };

  const locationLabel =
    latitude != null && longitude != null
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : 'Set location';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-gray-100">
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
              {service_name}
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">Providers near you</Text>
          </View>
        </View>

        {/* ── Filter Row ── */}
        <View className="mt-3">
          {/* Location */}
          <TouchableOpacity
            onPress={() => setShowMapPicker(true)}
            activeOpacity={0.8}
            style={styles.locationBtn}
          >
            <Ionicons name="location-outline" size={18} color={ORANGE} />
            <Text style={styles.locationBtnText} numberOfLines={1}>
              {locationLabel}
            </Text>
            <Text style={styles.locationBtnChange}>Change</Text>
          </TouchableOpacity>

          {/* Range */}
          <Text className="text-xs text-gray-400 font-medium mt-3 mb-1.5 uppercase tracking-wide">
            Search radius
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {RANGE_OPTIONS.map((opt) => (
              <Chip
                key={opt.label}
                label={opt.label}
                active={rangeKm === opt.value}
                onPress={() => setRangeKm(opt.value)}
              />
            ))}
          </ScrollView>

          {/* Sort */}
          <Text className="text-xs text-gray-400 font-medium mt-3 mb-1.5 uppercase tracking-wide">
            Sort by
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={sortBy === opt.value}
                onPress={() => setSortBy(sortBy === opt.value ? null : opt.value)}
              />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-400 mt-3 text-sm">Finding providers...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-3">⚠️</Text>
          <Text className="text-gray-600 text-center mb-3">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchProviders(1, false)}
            className="bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
          }
          renderItem={({ item }) => (
            <ProviderCard
              provider={item}
              onPress={() => router.push(`/(providers)/${item.id}/profile`)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            providers.length > 0 ? (
              <Text className="text-sm text-gray-400 mb-3">
                {providers.length} provider{providers.length !== 1 ? 's' : ''} found
              </Text>
            ) : null
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-6 items-center">
                <ActivityIndicator color={ORANGE} />
              </View>
            ) : hasMore ? (
              <TouchableOpacity
                onPress={loadMore}
                style={styles.loadMoreBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : providers.length > 0 ? (
              <Text className="text-center text-gray-400 text-sm py-4">
                All providers shown
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-5xl mb-3">👤</Text>
              <Text className="text-gray-600 font-semibold text-lg text-center">
                No providers found
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Try expanding the search radius or removing filters
              </Text>
            </View>
          }
        />
      )}

      {/* Map Picker */}
      <MapPickerModal
        visible={showMapPicker}
        initialLat={latitude ?? 0.3155}
        initialLng={longitude ?? 32.5822}
        onConfirm={(lat, lng) => {
          setLatitude(lat);
          setLongitude(lng);
          setShowMapPicker(false);
        }}
        onCancel={() => setShowMapPicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  locationBtnText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  locationBtnChange: {
    fontSize: 12,
    color: ORANGE,
    fontWeight: '600',
  },
  chip: {
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadMoreBtn: {
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ORANGE,
    alignItems: 'center',
  },
  loadMoreText: {
    color: ORANGE,
    fontWeight: '600',
    fontSize: 14,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mapHeaderBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  mapHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  mapConfirmBtn: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    backgroundColor: ORANGE,
  },
  mapConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
