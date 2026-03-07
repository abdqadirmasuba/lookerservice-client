import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/store/hooks';
import { setSelectedRequest } from '@/src/store/slices/requestsSlice';
import { apiRequests } from '@/src/utils/apiRequests';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/src/utils/formatters';
import type { ServiceRequest } from '@/src/types';

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequestDetails();
  }, [id]);

  const loadRequestDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequests.get(`/client/service-requests/${id}`);
      if (response.data.success) {
        setRequest(response.data.data);
        dispatch(setSelectedRequest(response.data.data));
      } else {
        setError(response.data.message || 'Failed to load request details');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load request details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' };
      case 'in_progress':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' };
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' };
      case 'cancelled':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' };
    }
  };

  const getRequestTypeInfo = (type: string) => {
    return type === 'direct' 
      ? { icon: '👤', label: 'Direct Request', color: 'text-purple-600 dark:text-purple-400' }
      : { icon: '📢', label: 'Open Request', color: 'text-blue-600 dark:text-blue-400' };
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2DA9E9" />
          <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">
            Loading request details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        <StatusBar style="auto" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-6xl mb-4">⚠️</Text>
          <Text className="text-gray-900 dark:text-white text-lg font-semibold mb-2 text-center">
            Could Not Load Request
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
            {error || 'Request not found'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(request.status);
  const typeInfo = getRequestTypeInfo(request.request_type);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-primary-600 dark:text-primary-300 text-3xl font-light">‹</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              Request Details
            </Text>
          </View>
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Header Card */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Text className="text-2xl mr-2">{typeInfo.icon}</Text>
                <View>
                  <Text className={`text-sm font-semibold ${typeInfo.color}`}>
                    {typeInfo.label}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    {request.request_number}
                  </Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                <Text className={`text-xs font-semibold ${statusColor.text}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            <Text className="text-xs text-gray-400 dark:text-gray-500">
              Created {formatRelativeTime(request.created_at)}
            </Text>
          </View>

          {/* Description */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Description
            </Text>
            <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">
              {request.description}
            </Text>
          </View>

          {/* Services */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Services Requested
            </Text>
            {request.services.map((service, index) => (
              <View
                key={service.id}
                className={`py-3 ${
                  index < request.services.length - 1
                    ? 'border-b border-gray-100 dark:border-[#334155]'
                    : ''
                }`}
              >
                <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                  {service.service_name}
                </Text>
                {service.category_name && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {service.category_name}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Budget & Schedule */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Budget & Schedule
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row items-start">
                <Text className="text-gray-600 dark:text-gray-400 text-sm w-32">Budget:</Text>
                <Text className="flex-1 text-gray-900 dark:text-white text-base font-medium">
                  {request.budget_min && request.budget_max
                    ? `${formatCurrency(request.budget_min)} - ${formatCurrency(request.budget_max)}`
                    : request.budget_min
                    ? `From ${formatCurrency(request.budget_min)}`
                    : request.budget_max
                    ? `Up to ${formatCurrency(request.budget_max)}`
                    : 'Negotiable'}
                </Text>
              </View>
              
              <View className="flex-row items-start">
                <Text className="text-gray-600 dark:text-gray-400 text-sm w-32">Preferred Date:</Text>
                <Text className="flex-1 text-gray-900 dark:text-white text-base font-medium">
                  {request.preferred_date ? formatDateTime(request.preferred_date) : 'Not specified'}
                </Text>
              </View>

              {request.deadline && (
                <View className="flex-row items-start">
                  <Text className="text-gray-600 dark:text-gray-400 text-sm w-32">Deadline:</Text>
                  <Text className="flex-1 text-gray-900 dark:text-white text-base font-medium">
                    {formatDateTime(request.deadline)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Service Location
            </Text>
            
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">📍</Text>
              <View className="flex-1">
                <Text className="text-base text-gray-900 dark:text-white font-medium mb-1">
                  {request.address}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {request.city}
                </Text>
                {request.location && (
                  <Text className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {request.location.latitude.toFixed(6)}, {request.location.longitude.toFixed(6)}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <View className="bg-white dark:bg-[#1E293B] rounded-xl p-5 mb-4 border border-gray-200 dark:border-[#334155]">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Images
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {request.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-24 h-24 rounded-lg"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

          {/* Bids Info */}
          {request.request_type === 'open' && (
            <View className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-5 mb-4 border border-primary-200 dark:border-primary-700">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-primary-900 dark:text-primary-100 mb-1">
                    {request.bid_count} {request.bid_count === 1 ? 'Bid' : 'Bids'} Received
                  </Text>
                  <Text className="text-sm text-primary-700 dark:text-primary-300">
                    {request.bid_count === 0
                      ? 'Waiting for providers to submit bids'
                      : 'Review and accept the best bid'}
                  </Text>
                </View>
                {request.bid_count > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      // TODO: Navigate to bids list
                      Alert.alert('Coming Soon', 'Bids list feature coming soon!');
                    }}
                    className="bg-primary-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-sm">View Bids</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {request.request_type === 'direct' && request.target_provider_name && (
            <View className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 mb-4 border border-purple-200 dark:border-purple-700">
              <Text className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                Sent to
              </Text>
              <Text className="text-lg font-bold text-purple-900 dark:text-purple-100">
                {request.target_provider_name}
              </Text>
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Action Buttons */}
      {request.status === 'open' && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Cancel Request',
                'Are you sure you want to cancel this request?',
                [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => {
                      // TODO: Implement cancel request
                      Alert.alert('Coming Soon', 'Cancel request feature coming soon!');
                    },
                  },
                ]
              );
            }}
            className="bg-red-500 py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
