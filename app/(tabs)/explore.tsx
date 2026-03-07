import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import {
  setProviders,
  appendProviders,
  setProvidersLoading,
  setProvidersLoadingMore,
  setProvidersError,
  setPagination,
  setExploreFilters,
  resetExploreFilters,
  clearProviders,
} from '@/src/store/slices/providersSlice';
import { apiRequests } from '@/src/utils/apiRequests';
import type { ProviderListItem, Service } from '@/src/types';
import { useDebounce } from '@/src/hooks';
import { ServiceCategorySelector } from '@/src/componets/modals/ServiceCategorySelector';

const PAGE_LIMIT = 20;

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
      className="bg-white dark:bg-[#1E293B] rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-[#334155] overflow-hidden"
    >
      {/* Top row */}
      <View className="flex-row items-center p-4">
        <View className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4 flex-shrink-0">
          <Text className="text-primary-600 dark:text-primary-300 font-bold text-lg">
            {initials}
          </Text>
        </View>

        <View className="flex-1 min-w-0">
          <Text
            className="text-base font-bold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {provider.business_name}
          </Text>

          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
            {provider.city}
          </Text>

          <View className="flex-row items-center mt-1.5">
            <Text className="text-yellow-400 text-xs mr-0.5">★</Text>
            <Text className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              {provider.average_rating?.toFixed(1) ?? '0.0'}
            </Text>
            <Text className="text-xs text-gray-400 dark:text-gray-500 ml-1">
              ({provider.total_reviews ?? 0} reviews)
            </Text>
            {provider.distance != null && provider.distance > 0 && (
              <Text className="text-xs text-gray-400 ml-3">
                {provider.distance < 1
                  ? `${(provider.distance * 1000).toFixed(0)} m away`
                  : `${provider.distance.toFixed(1)} km away`}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Description */}
      {provider.business_description && (
        <View className="px-4 pb-3">
          <Text className="text-sm text-gray-600 dark:text-gray-400" numberOfLines={2}>
            {provider.business_description}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="border-t border-gray-100 dark:border-[#334155] px-4 py-2.5 flex-row items-center justify-between">
        <Text className="text-xs text-gray-400 dark:text-gray-500">
          {provider.address}
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-primary-600 dark:text-primary-300 text-xs font-semibold">
            View Profile
          </Text>
          <Text className="text-primary-500 dark:text-primary-300 text-base">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Sort Chip ────────────────────────────────────────────────────────────────
function SortChip({
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
      className={`mr-2 px-4 py-2 rounded-full border ${
        active
          ? 'bg-primary-500 border-primary-500'
          : 'bg-white dark:bg-[#1E293B] border-gray-200 dark:border-[#334155]'
      }`}
    >
      <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const params = useLocalSearchParams<{
    serviceId?: string;
    serviceName?: string;
    categoryId?: string;
    categoryName?: string;
  }>();

  const providers = useAppSelector((s) => s.providers.providers);
  const isLoading = useAppSelector((s) => s.providers.isLoading);
  const isLoadingMore = useAppSelector((s) => s.providers.isLoadingMore);
  const error = useAppSelector((s) => s.providers.error);
  const pagination = useAppSelector((s) => s.providers.pagination);
  const filters = useAppSelector((s) => s.providers.exploreFilters);
  const categories = useAppSelector((s) => s.categories.categories);

  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  // Build query params object from filters + page
  const buildQueryParams = useCallback(
    (page: number) => {
      const params: any = {
        page,
        limit: PAGE_LIMIT,
      };

      if (filters.search?.trim()) params.search = filters.search.trim();
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.serviceId) params.serviceId = filters.serviceId;
      if (filters.location?.trim()) params.location = filters.location.trim();
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.latitude) params.latitude = filters.latitude;
      if (filters.longitude) params.longitude = filters.longitude;

      return params;
    },
    [filters]
  );

  // Fetch page 1 (resets list)
  const fetchPage1 = useCallback(async () => {
    dispatch(setProvidersLoading(true));
    dispatch(setProvidersError(null));
    try {
      const res = await apiRequests.get('/client/providers', buildQueryParams(1));
      if (res.data.success) {
        const data: ProviderListItem[] = res.data.data?.data ?? [];
        const paginationData = res.data.data?.pagination ?? {};

        dispatch(setProviders(data));
        dispatch(
          setPagination({
            page: paginationData.current_page ?? 1,
            totalPages: paginationData.total_pages ?? 1,
            total: paginationData.total ?? data.length,
            hasMore: (paginationData.current_page ?? 1) < (paginationData.total_pages ?? 1),
          })
        );
      } else {
        dispatch(setProvidersError(res.data.message || 'Failed to load providers'));
      }
    } catch (err: any) {
      dispatch(
        setProvidersError(
          err.response?.data?.message || 'Could not load providers. Please try again.'
        )
      );
    } finally {
      dispatch(setProvidersLoading(false));
    }
  }, [dispatch, buildQueryParams]);

  // Fetch next page (appends to list)
  const fetchNextPage = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;
    const nextPage = pagination.page + 1;
    dispatch(setProvidersLoadingMore(true));
    try {
      const res = await apiRequests.get('/client/providers', buildQueryParams(nextPage));
      if (res.data.success) {
        const data: ProviderListItem[] = res.data.data?.data ?? [];
        const paginationData = res.data.data?.pagination ?? {};

        dispatch(appendProviders(data));
        dispatch(
          setPagination({
            page: paginationData.current_page ?? nextPage,
            totalPages: paginationData.total_pages ?? pagination.totalPages,
            total: paginationData.total ?? pagination.total,
            hasMore: (paginationData.current_page ?? nextPage) < (paginationData.total_pages ?? pagination.totalPages),
          })
        );
      }
    } catch {
      // silently fail; user can tap Load More
    } finally {
      dispatch(setProvidersLoadingMore(false));
    }
  }, [dispatch, buildQueryParams, isLoadingMore, pagination]);

  // Load services for service filter
  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const res = await apiRequests.get('/client/services');
      if (res.data.success) {
        setServices(res.data.data ?? []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Init: apply URL params as initial filters then fetch
  useEffect(() => {
    const initFilters: Partial<typeof filters> = {};
    let hasFilters = false;

    if (params.categoryId) {
      initFilters.categoryId = params.categoryId;
      initFilters.categoryName = params.categoryName || null;
      hasFilters = true;
    }
    if (params.serviceId) {
      initFilters.serviceId = params.serviceId;
      initFilters.serviceName = params.serviceName || null;
      hasFilters = true;
    }

    if (hasFilters) {
      dispatch(setExploreFilters(initFilters));
    }

    fetchPage1();

    return () => {
      dispatch(clearProviders());
      dispatch(resetExploreFilters());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when debounced search or other filters change
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setExploreFilters({ search: debouncedSearch }));
    }
  }, [debouncedSearch, dispatch, filters.search]);

  useEffect(() => {
    // Only fetch if filters have actually changed after initial load
    if (providers.length > 0 || isLoading) {
      fetchPage1();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.categoryId, filters.serviceId, filters.location, filters.sortBy]);

  // Handlers
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPage1();
    setRefreshing(false);
  };

  const handleCategorySelect = (item: { id: string; name: string } | null) => {
    dispatch(
      setExploreFilters({
        categoryId: item?.id || null,
        categoryName: item?.name || null,
      })
    );
  };

  const handleServiceSelect = (item: { id: string; name: string } | null) => {
    dispatch(
      setExploreFilters({
        serviceId: item?.id || null,
        serviceName: item?.name || null,
      })
    );
  };

  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    dispatch(setExploreFilters({ sortBy }));
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    dispatch(resetExploreFilters());
  };

  const activeFilterCount = [
    filters.categoryId,
    filters.serviceId,
    filters.location,
    filters.search,
  ].filter(Boolean).length;

  // FlatList helpers
  const renderItem = useCallback(
    ({ item }: { item: ProviderListItem }) => (
      <ProviderCard provider={item} onPress={() => router.push(`/(providers)/${item.id}/profile`)} />
    ),
    [router]
  );
  const keyExtractor = useCallback((item: ProviderListItem) => item.id, []);

  // List footer
  const ListFooter = () => {
    if (isLoadingMore) {
      return (
        <View className="py-6 items-center">
          <ActivityIndicator color="#2DA9E9" />
          <Text className="text-sm text-gray-400 mt-2">Loading more...</Text>
        </View>
      );
    }
    if (pagination.hasMore && providers.length > 0) {
      return (
        <TouchableOpacity
          onPress={fetchNextPage}
          activeOpacity={0.8}
          className="py-4 mb-6 bg-primary-50 dark:bg-[#1E293B] border border-primary-200 dark:border-[#334155] rounded-xl items-center"
        >
          <Text className="text-primary-600 dark:text-primary-300 font-semibold text-sm">
            Load More Providers
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            Showing {providers.length} of {pagination.total}
          </Text>
        </TouchableOpacity>
      );
    }
    if (providers.length > 0) {
      return (
        <View className="py-6 items-center">
          <Text className="text-gray-400 text-sm">
            All {pagination.total} provider{pagination.total !== 1 ? 's' : ''} loaded
          </Text>
        </View>
      );
    }
    return null;
  };

  // Empty state
  const ListEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center justify-center py-20 px-8">
        <Text className="text-5xl mb-4">🔍</Text>
        <Text className="text-gray-700 dark:text-gray-300 font-semibold text-lg text-center">
          No providers found
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 text-sm">
          {activeFilterCount > 0
            ? 'Try adjusting your filters to see more results'
            : 'No providers are available yet.'}
        </Text>
        {activeFilterCount > 0 && (
          <TouchableOpacity
            onPress={handleClearAllFilters}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold text-sm">Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // List header (filters)
  const ListHeader = () => (
    <View>
      {/* Search bar */}
      <View className="pt-3 pb-2">
        <View className="flex-row items-center bg-gray-100 dark:bg-[#1E293B] rounded-xl px-4 py-3">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-gray-900 dark:text-white text-base"
            placeholder="Search by business name..."
            placeholderTextColor="#9CA3AF"
            value={searchInput}
            onChangeText={setSearchInput}
            returnKeyType="search"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchInput('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-gray-400 text-xl leading-none">×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter buttons: Category & Service */}
      <View className="pb-2 flex-row gap-2">
        <TouchableOpacity
          onPress={() => setShowCategoryModal(true)}
          activeOpacity={0.75}
          className={`flex-1 flex-row items-center justify-center px-4 py-2.5 rounded-xl border ${
            filters.categoryId
              ? 'bg-primary-50 dark:bg-blue-900/20 border-primary-300 dark:border-blue-700'
              : 'bg-gray-50 dark:bg-[#1E293B] border-gray-200 dark:border-[#334155]'
          }`}
        >
          <Text className="text-base mr-2">📂</Text>
          <Text
            className={`text-sm font-medium ${
              filters.categoryId
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            numberOfLines={1}
          >
            {filters.categoryName || 'Category'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (services.length === 0) loadServices();
            setShowServiceModal(true);
          }}
          activeOpacity={0.75}
          className={`flex-1 flex-row items-center justify-center px-4 py-2.5 rounded-xl border ${
            filters.serviceId
              ? 'bg-primary-50 dark:bg-blue-900/20 border-primary-300 dark:border-blue-700'
              : 'bg-gray-50 dark:bg-[#1E293B] border-gray-200 dark:border-[#334155]'
          }`}
        >
          <Text className="text-base mr-2">🛠️</Text>
          <Text
            className={`text-sm font-medium ${
              filters.serviceId
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            numberOfLines={1}
          >
            {filters.serviceName || 'Service'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort chips */}
      <View className="pb-2 -mx-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
        >
          <SortChip
            label="Best Rating"
            active={filters.sortBy === 'rating'}
            onPress={() => handleSortChange(filters.sortBy === 'rating' ? null : 'rating')}
          />
          <SortChip
            label="Most Reviews"
            active={filters.sortBy === 'reviews'}
            onPress={() => handleSortChange(filters.sortBy === 'reviews' ? null : 'reviews')}
          />
          <SortChip
            label="Nearest"
            active={filters.sortBy === 'distance'}
            onPress={() => handleSortChange(filters.sortBy === 'distance' ? null : 'distance')}
          />
        </ScrollView>
      </View>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <View className="pb-3 flex-row flex-wrap gap-2">
          {filters.categoryName && (
            <View className="flex-row items-center bg-primary-100 dark:bg-blue-900/30 rounded-full px-3 py-1">
              <Text className="text-primary-700 dark:text-primary-300 text-xs font-medium">
                📂 {filters.categoryName}
              </Text>
              <TouchableOpacity
                onPress={() => handleCategorySelect(null)}
                className="ml-1"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-primary-400 text-base">×</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.serviceName && (
            <View className="flex-row items-center bg-primary-100 dark:bg-blue-900/30 rounded-full px-3 py-1">
              <Text className="text-primary-700 dark:text-primary-300 text-xs font-medium">
                🛠️ {filters.serviceName}
              </Text>
              <TouchableOpacity
                onPress={() => handleServiceSelect(null)}
                className="ml-1"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text className="text-primary-400 text-base">×</Text>
              </TouchableOpacity>
            </View>
          )}
          {filters.location && (
            <View className="flex-row items-center bg-primary-100 dark:bg-blue-900/30 rounded-full px-3 py-1">
              <Text className="text-primary-700 dark:text-primary-300 text-xs font-medium">
                📍 {filters.location}
              </Text>
            </View>
          )}
          {activeFilterCount > 0 && (
            <TouchableOpacity
              onPress={handleClearAllFilters}
              className="flex-row items-center bg-gray-100 dark:bg-[#1E293B] rounded-full px-3 py-1"
            >
              <Text className="text-gray-600 dark:text-gray-400 text-xs font-medium">
                Clear All
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results count */}
      <View className="pb-2">
        <Text className="text-sm text-gray-400 dark:text-gray-500">
          {isLoading
            ? 'Searching...'
            : `${pagination.total > 0 ? pagination.total : providers.length} provider${
                (pagination.total || providers.length) !== 1 ? 's' : ''
              } found`}
        </Text>
      </View>
    </View>
  );

  const screenTitle = filters.serviceName || filters.categoryName || 'Explore Providers';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      {/* Screen top header */}
      <View className="px-4 pt-4 pb-3 bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-[#1E293B]">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {screenTitle}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Find the right service provider for your needs
        </Text>
      </View>

      {/* Full-screen initial loader */}
      {isLoading && providers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Loading providers...
          </Text>
        </View>
      ) : error && providers.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">⚠️</Text>
          <Text className="text-gray-700 dark:text-gray-300 font-semibold text-center mb-2">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchPage1()}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={providers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={<ListEmpty />}
          ListFooterComponent={<ListFooter />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
          }
          onEndReached={pagination.hasMore ? fetchNextPage : undefined}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Category selector modal */}
      <ServiceCategorySelector
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        items={categories}
        selectedId={filters.categoryId}
        title="Select Category"
        placeholder="Search categories..."
      />

      {/* Service selector modal */}
      <ServiceCategorySelector
        visible={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSelect={handleServiceSelect}
        items={services}
        selectedId={filters.serviceId}
        title="Select Service"
        placeholder="Search services..."
        isLoading={loadingServices}
      />
    </SafeAreaView>
  );
}
