import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import {
  setProviderCategories,
  setCategories,
  setLoadingCategories,
  toggleProviderService,
  toggleService,
  setError,
  nextStep,
} from '@/src/store/slices/serviceRequestFormSlice';
import { fetchCategories } from '@/src/store/slices/categoriesSlice';
import { apiRequests } from '@/src/utils/apiRequests';
import type { ProviderCategory, Category } from '@/src/types';

export default function Step1Screen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const {
    requestType,
    providerId,
    providerName,
    providerCategories,
    selectedProviderServiceIds,
    categories,
    selectedServiceIds,
    isLoadingCategories,
    error,
  } = useAppSelector((state) => state.serviceRequestForm);

  useEffect(() => {
    if (requestType === 'direct') {
      if (!providerId) {
        Alert.alert('Error', 'No provider selected. Please go back and select a provider.');
        router.back();
        return;
      }
      loadProviderCategories();
    } else {
      // Open request
      loadGeneralCategories();
    }
  }, [requestType, providerId]);

  const loadProviderCategories = async () => {
    if (!providerId) return;
    
    dispatch(setLoadingCategories(true));
    try {
      const res = await apiRequests.get(`/client/providers/${providerId}/category-services`);
      if (res.data.success) {
        dispatch(setProviderCategories(res.data.data));
      } else {
        dispatch(setError(res.data.message || 'Failed to load services'));
        Alert.alert('Error', res.data.message || 'Failed to load services');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Could not load services';
      dispatch(setError(errorMsg));
      Alert.alert('Error', errorMsg);
    } finally {
      dispatch(setLoadingCategories(false));
    }
  };

  const loadGeneralCategories = async () => {
    dispatch(setLoadingCategories(true));
    try {
      const result = await dispatch(fetchCategories()).unwrap();
      dispatch(setCategories(result));
    } catch (err: any) {
      const errorMsg = err || 'Could not load categories';
      dispatch(setError(errorMsg));
      Alert.alert('Error', errorMsg);
      dispatch(setLoadingCategories(false));
    }
  };

  const handleToggleService = (serviceId: string) => {
    if (requestType === 'direct') {
      dispatch(toggleProviderService(serviceId));
    } else {
      dispatch(toggleService(serviceId));
    }
  };

  const handleNext = () => {
    const selectedCount = requestType === 'direct' 
      ? selectedProviderServiceIds.length 
      : selectedServiceIds.length;
      
    if (selectedCount === 0) {
      Alert.alert('Select Services', 'Please select at least one service to continue.');
      return;
    }
    dispatch(nextStep());
    router.push('/(service-request)/create/step2');
  };

  const handleBack = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this service request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => router.replace('/(tabs)/home'), style: 'destructive' },
      ]
    );
  };

  // Get the appropriate data based on request type
  const displayCategories = requestType === 'direct' ? providerCategories : categories;
  const displaySelectedIds = requestType === 'direct' ? selectedProviderServiceIds : selectedServiceIds;

  if (isLoadingCategories) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Loading services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155]">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-primary-600 dark:text-primary-300 text-3xl font-light">‹</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              {requestType === 'direct' ? 'Request Service' : 'Post Open Request'}
            </Text>
            {providerName && requestType === 'direct' && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-0.5">
                from {providerName}
              </Text>
            )}
          </View>
          <View className="w-8" />
        </View>
        
        {/* Progress Bar */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Step 1 of 4: Select Services
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {requestType === 'direct' 
              ? `Select the services you need from ${providerName}`
              : 'Select the services you need. Multiple providers will be able to bid on your request.'
            }
          </Text>

          {displayCategories.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-5xl mb-3">🔧</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No services available
              </Text>
            </View>
          ) : (
            displayCategories.map((category) => (
              <View key={category.id} className="mb-6">
                {/* Category Header */}
                <View className="flex-row items-center mb-3">
                  {category.icon_url && (
                    <Image
                      source={{ uri: category.icon_url }}
                      className="w-8 h-8 mr-2"
                      resizeMode="contain"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </Text>
                    {category.description && (
                      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {category.description}
                      </Text>
                    )}
                  </View>
                  <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded-full">
                    <Text className="text-primary-600 dark:text-primary-300 text-xs font-semibold">
                      {category.services.length}
                    </Text>
                  </View>
                </View>

                {/* Services */}
                <View className="space-y-2">
                  {category.services.map((service) => {
                    const isSelected = displaySelectedIds.includes(service.id);
                    return (
                      <TouchableOpacity
                        key={service.id}
                        onPress={() => handleToggleService(service.id)}
                        className={`border-2 rounded-xl p-4 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-[#334155] bg-white dark:bg-[#1E293B]'
                        }`}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-start">
                          {/* Checkbox */}
                          <View
                            className={`w-6 h-6 rounded-md mr-3 mt-0.5 items-center justify-center ${
                              isSelected
                                ? 'bg-primary-500'
                                : 'bg-white dark:bg-[#0F172A] border-2 border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {isSelected && (
                              <Text className="text-white text-sm font-bold">✓</Text>
                            )}
                          </View>

                          {/* Service Info */}
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              {service.name}
                            </Text>
                            {service.description && (
                              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {service.description}
                              </Text>
                            )}
                            {requestType === 'direct' && 'pricing_type' in service && (
                              <View className="flex-row items-center justify-between">
                                <Text className="text-xs text-gray-500 dark:text-gray-500">
                                  {service.pricing_type === 'fixed'
                                    ? 'Fixed price'
                                    : service.pricing_type === 'hourly'
                                    ? 'Per hour'
                                    : 'Negotiable'}
                                </Text>
                                <Text
                                  className={`text-base font-bold ${
                                    isSelected
                                      ? 'text-primary-600 dark:text-primary-300'
                                      : 'text-gray-900 dark:text-white'
                                  }`}
                                >
                                  {service.base_price && service.base_price > 0
                                    ? `${service.currency} ${Number(service.base_price).toLocaleString()}`
                                    : 'Quote'}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
        {displaySelectedIds.length > 0 && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            {displaySelectedIds.length} {displaySelectedIds.length === 1 ? 'service' : 'services'} selected
          </Text>
        )}
        <TouchableOpacity
          onPress={handleNext}
          disabled={displaySelectedIds.length === 0}
          className={`py-4 rounded-xl items-center ${
            displaySelectedIds.length > 0
              ? 'bg-primary-500'
              : 'bg-gray-300 dark:bg-gray-700'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`font-bold text-base ${
              displaySelectedIds.length > 0
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-500'
            }`}
          >
            Next: Budget & Schedule
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
