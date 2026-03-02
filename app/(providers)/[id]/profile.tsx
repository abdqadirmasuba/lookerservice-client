import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiRequests } from '@/src/utils/apiRequests';
import type { Provider, Service, Category } from '@/src/types';

interface ProviderDetails extends Provider {
  categories?: Category[];
  services?: Service[];
}

export default function ProviderProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [provider, setProvider] = useState<ProviderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProviderDetails();
  }, [id]);

  const loadProviderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequests.get(`/client/providers/${id}`);
      if (res.data.success) {
        setProvider(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load provider details');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load provider details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleRequestService = () => {
    router.push(`/(service-request)/create/step1?providerId=${id}`);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
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
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">⚠️</Text>
          <Text className="text-gray-700 dark:text-gray-300 font-semibold text-center mb-2">
            {error || 'Provider not found'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = provider.businessName
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      {/* Header with back button */}
      <View className="px-4 pt-3 pb-3 bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-[#1E293B] flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-primary-600 dark:text-primary-300 text-2xl mr-3">‹</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
          {provider.businessName}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View className="bg-white dark:bg-[#1E293B] px-4 py-6 border-b border-gray-100 dark:border-[#334155]">
          <View className="flex-row items-start">
            {/* Avatar */}
            {provider.profileImage ? (
              <Image
                source={{ uri: provider.profileImage }}
                className="w-20 h-20 rounded-full mr-4"
              />
            ) : (
              <View className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
                <Text className="text-primary-600 dark:text-primary-300 font-bold text-2xl">
                  {initials}
                </Text>
              </View>
            )}

            {/* Info */}
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1" numberOfLines={2}>
                  {provider.businessName}
                </Text>
                {provider.isVerified && (
                  <View className="bg-blue-50 dark:bg-blue-900/40 rounded-full px-2 py-1 ml-2">
                    <Text className="text-primary-600 dark:text-primary-300 text-xs font-semibold">
                      ✓ Verified
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row items-center mt-2">
                <Text className="text-yellow-400 text-base mr-1">★</Text>
                <Text className="text-base text-gray-700 dark:text-gray-300 font-semibold">
                  {provider.rating?.toFixed(1) ?? '0.0'}
                </Text>
                <Text className="text-sm text-gray-400 dark:text-gray-500 ml-1">
                  ({provider.reviewsCount ?? 0} reviews)
                </Text>
              </View>

              <View className="flex-row items-center mt-2">
                <Text className="text-gray-500 dark:text-gray-400 text-sm">📍</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  {[provider.location?.city, provider.location?.district].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {provider.description && (
            <View className="mt-4">
              <Text className="text-gray-700 dark:text-gray-300 text-base leading-6">
                {provider.description}
              </Text>
            </View>
          )}
        </View>

        {/* Categories */}
        {provider.categories && provider.categories.length > 0 && (
          <View className="bg-white dark:bg-[#1E293B] px-4 py-5 mt-2 border-b border-gray-100 dark:border-[#334155]">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Categories
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {provider.categories.map((category) => (
                <View
                  key={category.id}
                  className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-full px-4 py-2"
                >
                  <Text className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                    {category.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Services offered */}
        {provider.servicesOffered && provider.servicesOffered.length > 0 && (
          <View className="bg-white dark:bg-[#1E293B] px-4 py-5 mt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Services Offered
            </Text>
            <View className="space-y-3">
              {provider.servicesOffered.map((service, index) => (
                <View
                  key={service.id}
                  className={`pb-3 ${
                    index < provider.servicesOffered!.length - 1
                      ? 'border-b border-gray-100 dark:border-[#334155]'
                      : ''
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </Text>
                      {service.description && (
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {service.description}
                        </Text>
                      )}
                      {service.category && (
                        <View className="mt-1.5">
                          <Text className="text-xs text-gray-400 dark:text-gray-500">
                            Category: {service.category.name}
                          </Text>
                        </View>
                      )}
                      {service.duration && (
                        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Duration: ~{service.duration} min
                        </Text>
                      )}
                    </View>
                    <View className="ml-4">
                      <Text className="text-base font-bold text-primary-600 dark:text-primary-300">
                        {service.priceType === 'fixed'
                          ? `UGX ${service.price.toLocaleString()}`
                          : service.priceType === 'starting_from'
                          ? `From UGX ${service.price.toLocaleString()}`
                          : 'Negotiable'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact information */}
        {(provider.contactInfo?.phone || provider.contactInfo?.email) && (
          <View className="bg-white dark:bg-[#1E293B] px-4 py-5 mt-2">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Contact Information
            </Text>
            {provider.contactInfo.phone && (
              <TouchableOpacity
                onPress={() => handleCall(provider.contactInfo.phone)}
                className="flex-row items-center py-3 border-b border-gray-100 dark:border-[#334155]"
              >
                <Text className="text-2xl mr-3">📞</Text>
                <Text className="text-base text-primary-600 dark:text-primary-300 font-medium">
                  {provider.contactInfo.phone}
                </Text>
              </TouchableOpacity>
            )}
            {provider.contactInfo.email && (
              <TouchableOpacity
                onPress={() => handleEmail(provider.contactInfo.email)}
                className="flex-row items-center py-3"
              >
                <Text className="text-2xl mr-3">✉️</Text>
                <Text className="text-base text-primary-600 dark:text-primary-300 font-medium">
                  {provider.contactInfo.email}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed bottom action button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-100 dark:border-[#334155] px-4 py-4 safe-bottom">
        <TouchableOpacity
          onPress={handleRequestService}
          className="bg-primary-500 py-4 rounded-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">Request Service</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

