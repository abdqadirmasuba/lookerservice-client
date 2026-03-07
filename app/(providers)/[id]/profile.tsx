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
import { useAppDispatch } from '@/src/store/hooks';
import { initializeDirectRequest } from '@/src/store/slices/serviceRequestFormSlice';
import { apiRequests } from '@/src/utils/apiRequests';
import LocationMapModal from '@/src/componets/modals/LocationMapModal';
import type { ProviderDetailsResponse, ProviderService } from '@/src/types';

interface CategoryServicesResponse {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  services: ProviderService[];
}

interface ProviderCategory {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  services: ProviderService[];
}

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [provider, setProvider] = useState<ProviderDetailsResponse | null>(null);
  const [categories, setCategories] = useState<ProviderCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadProviderData();
  }, [id]);

  const loadProviderData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch provider details and categories in parallel
      const [detailsRes, categoriesRes] = await Promise.all([
        apiRequests.get(`/client/providers/${id}`),
        apiRequests.get(`/client/providers/${id}/category-services`)
      ]);

      if (detailsRes.data.success) {
        setProvider(detailsRes.data.data);
      } else {
        setError(detailsRes.data.message || 'Failed to load provider details');
      }

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
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
    if (!provider) return;
    
    // Initialize the direct service request form in Redux
    dispatch(initializeDirectRequest({
      providerId: provider.id,
      providerName: provider.business_name,
    }));
    
    // Navigate to step 1 (service selection)
    router.push('/(service-request)/create/step1');
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: '✓ Verified', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' };
      case 'pending':
        return { label: '⏳ Pending', color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' };
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Loading provider details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !provider) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-gray-700 dark:text-gray-300 font-semibold text-center text-lg mb-2">
            Provider Not Found
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {error || 'Unable to load provider details'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-8 py-3 rounded-xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const verificationBadge = getVerificationBadge(provider.verification_status);
  // const initials = provider.business_name
  //   .split(' ')
  //   .slice(0, 2)
  //   .map((w) => w.charAt(0).toUpperCase())
  //   .join('');
  
  // const totalServices = provider.categories.reduce((sum, cat) => sum + cat.services.length, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Provider Header Card */}
        <View className="bg-white dark:bg-[#1E293B] px-5 py-6 border-b border-gray-100 dark:border-[#334155]">
          <View className="flex-row items-start">
            {/* Avatar */}
            <View className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 items-center justify-center shadow-sm">
              <Text className="text-primary-600 dark:text-primary-300 font-bold text-2xl">
                {/* {initials} */}
                MK
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1 ml-4">
              <View className="flex-row items-start justify-between mb-2">
                <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1 pr-2" numberOfLines={2}>
                  {provider.business_name}
                </Text>
              </View>

              {verificationBadge && (
                <View className={`${verificationBadge.color} self-start rounded-full px-3 py-1 mb-2`}>
                  <Text className={`text-xs font-semibold ${verificationBadge.color.split(' ')[2]}`}>
                    {verificationBadge.label}
                  </Text>
                </View>
              )}

              {/* Rating */}
              <View className="flex-row items-center mb-2">
                <Text className="text-yellow-500 text-lg mr-1">★</Text>
                <Text className="text-base text-gray-700 dark:text-gray-300 font-semibold">
                  {provider.rating_summary.average_rating.toFixed(1)}
                </Text>
                <Text className="text-sm text-gray-400 dark:text-gray-500 ml-1">
                  ({provider.rating_summary.total_reviews} reviews)
                </Text>
              </View>

              {/* Stats */}
              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm mr-1">📋</Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.total_bookings} bookings
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 text-sm mr-1">📅</Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400">
                    Since {new Date(provider.member_since).getFullYear()}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          {provider.business_description && (
            <View className="mt-4 pt-4 border-t border-gray-100 dark:border-[#334155]">
              <Text className="text-gray-700 dark:text-gray-300 text-base leading-6">
                {provider.business_description}
              </Text>
            </View>
          )}
        </View>

        {/* Location Card */}
        <View className="bg-white dark:bg-[#1E293B] px-5 py-5 mt-2 border-b border-gray-100 dark:border-[#334155]">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            📍 Location
          </Text>
          <View className="space-y-1">
            <Text className="text-base text-gray-700 dark:text-gray-300 font-medium">
              {provider.address}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {[provider.city, provider.state_region, provider.country].filter(Boolean).join(', ')}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleViewLocation}
            className="mt-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 py-3 rounded-xl flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-primary-600 dark:text-primary-300 font-semibold text-base mr-2">
              🗺️ View on Map
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View className="bg-white dark:bg-[#1E293B] px-5 py-5 mt-2 border-b border-gray-100 dark:border-[#334155]">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            📞 Contact
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 text-sm w-16">Name:</Text>
              <Text className="text-gray-900 dark:text-white text-base font-medium">
                {provider.contact_info.full_name}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-400 text-sm w-16">Email:</Text>
              <Text className="text-primary-600 dark:text-primary-300 text-base">
                {provider.contact_info.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Services by Category */}
        {categories.length > 0 ? (
          categories.map((category) => (
          <View
            key={category.id}
            className="bg-white dark:bg-[#1E293B] px-5 py-5 mt-2 border-b border-gray-100 dark:border-[#334155]"
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {category.name}
                </Text>
                {category.description && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {category.description}
                  </Text>
                )}
              </View>
              <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full ml-3">
                <Text className="text-primary-600 dark:text-primary-300 text-xs font-semibold">
                  {category.services.length} {category.services.length === 1 ? 'service' : 'services'}
                </Text>
              </View>
            </View>

            {/* Services List */}
            <View className="space-y-3">
              {category.services.map((service, index) => (
                <View
                  key={service.id}
                  className="border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#0F172A] rounded-xl p-4"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {service.name}
                      </Text>
                      
                      {service.description && (
                        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {service.description}
                        </Text>
                      )}
                      
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                        {service.pricing_type === 'fixed' ? 'Fixed price' :
                         service.pricing_type === 'hourly' ? 'Per hour' : 'Negotiable'}
                      </Text>
                    </View>
                    
                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        {service.base_price > 0
                          ? `${service.currency} ${Number(service.base_price).toLocaleString()}`
                          : 'Quote'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))
        ) : (
          <View className="bg-white dark:bg-[#1E293B] px-5 py-8 mt-2">
            <Text className="text-center text-5xl mb-3">🔧</Text>
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
              No Services Available
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center">
              This provider hasn't added any services yet. Check back later!
            </Text>
          </View>
        )}

        {/* Reviews Section (placeholder) */}
        {provider.reviews && provider.reviews.length > 0 ? (
          <View className="bg-white dark:bg-[#1E293B] px-5 py-5 mt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              ⭐ Reviews
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Reviews will be displayed here
            </Text>
          </View>
        ) : (
          <View className="bg-white dark:bg-[#1E293B] px-5 py-5 mt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ⭐ Reviews
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              No reviews yet. Be the first to review this provider!
            </Text>
          </View>
        )}

        {/* Bottom spacing for fixed button */}
        <View className="h-32" />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4 shadow-lg">
        <TouchableOpacity
          onPress={handleRequestService}
          className="bg-primary-500 active:bg-primary-600 py-4 rounded-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            📋 Request Service
          </Text>
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

