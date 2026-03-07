import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { previousStep, resetForm } from '@/src/store/slices/serviceRequestFormSlice';
import { addRequest } from '@/src/store/slices/requestsSlice';
import { apiRequests } from '@/src/utils/apiRequests';

export default function Step4Screen() {
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
    description,
    budgetMin,
    budgetMax,
    preferredDate,
    deadline,
    latitude,
    longitude,
    address,
    city,
    images,
    notifyCategories,
    notifyLocation,
    notifyRadiusMeters,
    notifyLimit,
  } = useAppSelector((state) => state.serviceRequestForm);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get selected services details
  const getSelectedServices = () => {
    const services: any[] = [];
    if (requestType === 'direct') {
      providerCategories.forEach(category => {
        category.services.forEach(service => {
          if (selectedProviderServiceIds.includes(service.id)) {
            services.push({ ...service, categoryName: category.name });
          }
        });
      });
    } else {
      categories.forEach(category => {
        category.services.forEach(service => {
          if (selectedServiceIds.includes(service.id)) {
            services.push({ ...service, categoryName: category.name });
          }
        });
      });
    }
    return services;
  };

  const selectedServices = getSelectedServices();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let payload: any;
      let endpoint: string;

      if (requestType === 'direct') {
        // Direct request payload
        endpoint = '/client/service-requests/direct';
        payload = {
          target_provider_id: providerId,
          provider_service_ids: selectedProviderServiceIds,
          description: description,
          latitude: latitude || 0,
          longitude: longitude || 0,
          address: address,
          city: city,
        };

        // Add optional fields
        if (budgetMin) payload.budget_min = budgetMin;
        if (budgetMax) payload.budget_max = budgetMax;
        if (preferredDate) payload.preferred_date = preferredDate;
        if (deadline) payload.deadline = deadline;
        if (images.length > 0) payload.images = images;
      } else {
        // Open request payload
        endpoint = '/client/service-requests/open';
        payload = {
          service_ids: selectedServiceIds,
          description: description,
          latitude: latitude || 0,
          longitude: longitude || 0,
          address: address,
          city: city,
        };

        // Add optional fields
        if (budgetMin) payload.budget_min = budgetMin;
        if (budgetMax) payload.budget_max = budgetMax;
        if (preferredDate) payload.preferred_date = preferredDate;
        if (deadline) payload.deadline = deadline;
        if (images.length > 0) payload.images = images;
        
        // Add notification settings if any categories are selected
        if (notifyCategories.length > 0) {
          payload.notify_categories = notifyCategories;
        }
        if (notifyLocation) payload.notify_location = notifyLocation;
        if (notifyRadiusMeters !== 50000) payload.notify_radius_meters = notifyRadiusMeters;
        if (notifyLimit !== 50) payload.notify_limit = notifyLimit;
      }

      const res = await apiRequests.post(endpoint, payload);

      if (res.data.success) {
        // Add to Redux store
        dispatch(addRequest(res.data.data));
        
        // Reset form
        dispatch(resetForm());

        const successTitle = requestType === 'direct' ? 'Request Sent! 🎉' : 'Request Posted! 🎉';
        const successMessage = requestType === 'direct' 
          ? `Your service request has been sent to ${providerName}. They will review it and respond soon.`
          : 'Your open service request has been posted successfully. Providers will start bidding soon!';

        Alert.alert(
          successTitle,
          successMessage,
          [
            {
              text: 'View Requests',
              onPress: () => router.replace('/(tabs)/requests'),
            },
            {
              text: 'Go Home',
              onPress: () => router.replace('/(tabs)/home'),
              style: 'cancel',
            },
          ]
        );
      } else {
        throw new Error(res.data.message || 'Failed to submit request');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert(
        'Submission Failed',
        error.response?.data?.message || error.message || 'Could not submit your request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    dispatch(previousStep());
    router.back();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155]">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={isSubmitting}
          >
            <Text className="text-primary-600 dark:text-primary-300 text-3xl font-light">‹</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              Review & Submit
            </Text>
            {providerName && requestType === 'direct' && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-0.5">
                to {providerName}
              </Text>
            )}
          </View>
          <View className="w-8" />
        </View>
        
        {/* Progress Bar */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Step 4 of 4: Review & Submit
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Services Summary */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Selected Services
              </Text>
              <TouchableOpacity onPress={() => router.push('/(service-request)/create/step1')}>
                <Text className="text-primary-600 dark:text-primary-300 text-sm font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            {selectedServices.map((service, index) => (
              <View
                key={service.id}
                className={`py-3 ${
                  index < selectedServices.length - 1
                    ? 'border-b border-gray-100 dark:border-[#334155]'
                    : ''
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {service.categoryName}
                    </Text>
                  </View>
                  {requestType === 'direct' && 'base_price' in service && service.base_price > 0 && (
                    <Text className="text-base font-bold text-gray-900 dark:text-white ml-3">
                      {service.currency} {Number(service.base_price).toLocaleString()}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Description */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Description
              </Text>
              <TouchableOpacity onPress={() => router.push('/(service-request)/create/step2')}>
                <Text className="text-primary-600 dark:text-primary-300 text-sm font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">
              {description}
            </Text>
          </View>

          {/* Budget & Schedule */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Budget & Schedule
              </Text>
              <TouchableOpacity onPress={() => router.push('/(service-request)/create/step2')}>
                <Text className="text-primary-600 dark:text-primary-300 text-sm font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-gray-600 dark:text-gray-400 text-sm w-24">Budget:</Text>
                <Text className="flex-1 text-gray-900 dark:text-white text-base font-medium">
                  {budgetMin && budgetMax
                    ? `UGX ${Number(budgetMin).toLocaleString()} - ${Number(budgetMax).toLocaleString()}`
                    : budgetMin
                    ? `From UGX ${Number(budgetMin).toLocaleString()}`
                    : budgetMax
                    ? `Up to UGX ${Number(budgetMax).toLocaleString()}`
                    : 'Negotiable'}
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Text className="text-gray-600 dark:text-gray-400 text-sm w-24">When:</Text>
                <Text className="flex-1 text-gray-900 dark:text-white text-base font-medium">
                  {formatDate(preferredDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Service Location
              </Text>
              <TouchableOpacity onPress={() => router.push('/(service-request)/create/step3')}>
                <Text className="text-primary-600 dark:text-primary-300 text-sm font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Text className="text-2xl mr-2">📍</Text>
                <View className="flex-1">
                  <Text className="text-base text-gray-900 dark:text-white font-medium">
                    {address}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {city}
                  </Text>
                  {latitude && longitude && (
                    <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <Text className="text-xl mr-2">✓</Text>
              <Text className="flex-1 text-sm text-green-900 dark:text-green-200">
                {requestType === 'direct'
                  ? `Your request will be sent to ${providerName}. They will review it and respond with quotes or proposals.`
                  : 'Your open request will be posted and multiple providers will be notified. They can submit bids for you to review and choose from.'}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-4 rounded-xl items-center flex-row justify-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-primary-500'
          }`}
          activeOpacity={0.8}
        >
          {isSubmitting && (
            <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />
          )}
          <Text className="text-white font-bold text-base">
            {isSubmitting ? 'Submitting...' : '✓ Submit Request'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
