import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '@/src/store/hooks';
import { setSelectedRequest, updateRequest } from '@/src/store/slices/requestsSlice';
import { apiRequests } from '@/src/utils/apiRequests';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/src/utils/formatters';
import SvgIcon from '@/src/componets/common/SvgIcon';
import type { ServiceRequest } from '@/src/types';

export default function ServiceRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      case 'responded':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' };
      case 'in_progress':
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' };
      case 'completed':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' };
      case 'rejected':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' };
      case 'closed':
      case 'cancelled':
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' };
    }
  };

  const handleCloseRequest = () => {
    Alert.alert(
      'Close Request',
      'Are you sure you want to close this request? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Request',
          style: 'destructive',
          onPress: async () => {
            setIsClosing(true);
            try {
              const response = await apiRequests.post(`/client/service-requests/${id}/close`, {});
              if (response.data.success) {
                const updated = { ...request!, status: 'closed' as const };
                setRequest(updated);
                dispatch(updateRequest(updated));
              } else {
                Alert.alert('Error', response.data.message || 'Failed to close request');
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Could not close request');
            } finally {
              setIsClosing(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async () => {
    if (!editDescription.trim()) {
      Alert.alert('Validation', 'Description cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiRequests.patch(`/client/service-requests/${id}`, {
        description: editDescription.trim(),
      });
      if (response.data.success) {
        const updated = { ...request!, description: editDescription.trim(), status: 'open' as const };
        setRequest(updated);
        dispatch(updateRequest(updated));
        setIsEditing(false);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update request');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not update request');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Request Details</Text>
          <View className="w-9" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-5 gap-3">

          {/* ── 1. Header card: number / type / status ── */}
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons
                    name={request.request_type === 'direct' ? 'person-outline' : 'megaphone-outline'}
                    size={15}
                    color="#6B7280"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-gray-500">
                    {request.request_type === 'direct' ? 'Direct Request' : 'Open Request'}
                  </Text>
                  <Text className="text-[11px] text-gray-400 font-mono">{request.request_number}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${statusColor.bg}`}>
                <Text className={`text-xs font-bold ${statusColor.text}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            {request.provider_response && request.provider_response !== 'pending' && (
              <View className="mt-2 flex-row items-center gap-1.5">
                <Ionicons
                  name={request.provider_response === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={request.provider_response === 'accepted' ? '#16A34A' : '#DC2626'}
                />
                <Text className={`text-xs font-semibold ${request.provider_response === 'accepted' ? 'text-green-700' : 'text-red-600'}`}>
                  Provider {request.provider_response}
                </Text>
              </View>
            )}
            <Text className="text-[11px] text-gray-400 mt-2">
              Sent {formatRelativeTime(request.created_at)}
            </Text>
          </View>

          {/* ── 2. Rejection reason ── */}
          {request.status === 'rejected' && request.rejection_reason && (
            <View className="bg-red-50 rounded-2xl p-4 border border-red-200">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="ban-outline" size={16} color="#DC2626" />
                <Text className="text-sm font-bold text-red-800">Request Rejected</Text>
              </View>
              <Text className="text-sm text-red-700 leading-5">{request.rejection_reason}</Text>
            </View>
          )}

          {/* ── 3. Provider card ── */}
          {request.business_name && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Provider</Text>
              <View className="flex-row items-center">
                {request.business_logo ? (
                  <Image
                    source={{ uri: request.business_logo }}
                    style={{ width: 52, height: 52, borderRadius: 14, marginRight: 12 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: 52, height: 52, borderRadius: 14, marginRight: 12,
                      backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#F57C1F', fontWeight: '800', fontSize: 18 }}>
                      {request.business_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text className="text-base font-bold text-gray-900 flex-1" numberOfLines={2}>
                  {request.business_name}
                </Text>
              </View>
            </View>
          )}

          {/* ── 4. Services ── */}
          {request.services && request.services.length > 0 && (
            <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <View className="px-4 pt-4 pb-2">
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  Services Requested
                </Text>
              </View>
              {request.services.map((svc, idx) => (
                <View
                  key={svc.id}
                  className={`px-4 py-3 ${idx < request.services!.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {/* Service header */}
                  <View className="flex-row items-center gap-3 mb-1.5">
                    <View className="w-9 h-9 rounded-[10px] bg-orange-50 items-center justify-center shrink-0">
                      <SvgIcon uri={svc.service_icon ?? svc.service_icon_url ?? ''} size={20} fallback="⚙️" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[13px] font-bold text-gray-900" numberOfLines={1}>
                        {svc.service_name}
                      </Text>
                      {svc.category_name && (
                        <Text className="text-[11px] text-gray-400 mt-0.5">{svc.category_name}</Text>
                      )}
                    </View>
                  </View>
                  {/* Items */}
                  {svc.items && svc.items.length > 0 && (
                    <View className="ml-12 gap-1">
                      {svc.items.map((item, iIdx) => (
                        <View key={iIdx} className="flex-row items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                          <Text className="text-[12px] text-gray-700 flex-1 mr-2" numberOfLines={1}>
                            {item.label}
                          </Text>
                          {item.amount !== undefined && (
                            <Text className="text-[12px] font-bold text-orange-500 shrink-0">
                              {item.currency ?? 'UGX'} {item.amount.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* ── 5. Description (only if non-empty) ── */}
          {!!request.description?.trim() && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Description</Text>
              {isEditing ? (
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  numberOfLines={5}
                  className="text-sm text-gray-700 leading-5 border border-gray-200 rounded-xl p-3"
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              ) : (
                <Text className="text-sm text-gray-700 leading-5">{request.description}</Text>
              )}
            </View>
          )}

          {/* ── 6. Images (only if present) ── */}
          {request.images && request.images.length > 0 && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {request.images.map((uri, idx) => (
                    <Image
                      key={idx}
                      source={{ uri }}
                      style={{ width: 88, height: 88, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* ── 7. Budget (only if set) ── */}
          {(request.budget_min != null || request.budget_max != null) && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="cash-outline" size={16} color="#16A34A" />
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Budget</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-800 mt-1">
                {request.budget_min != null && request.budget_max != null
                  ? `${formatCurrency(request.budget_min)} – ${formatCurrency(request.budget_max)}`
                  : request.budget_min != null
                  ? `From ${formatCurrency(request.budget_min)}`
                  : `Up to ${formatCurrency(request.budget_max!)}`}
              </Text>
            </View>
          )}

          {/* ── 8. Preferred date (only if set) ── */}
          {request.preferred_date && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="calendar-outline" size={16} color="#2DA9E9" />
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Preferred Date</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-800 mt-1">
                {formatDateTime(request.preferred_date)}
              </Text>
            </View>
          )}

          {/* ── 9. Deadline (only if set) ── */}
          {request.deadline && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="hourglass-outline" size={16} color="#DC2626" />
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Deadline</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-800 mt-1">
                {formatDateTime(request.deadline)}
              </Text>
            </View>
          )}

          {/* ── 10. Location (only if address or city is non-empty) ── */}
          {(!!request.address?.trim() || !!request.city?.trim()) && (
            <View className="bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="location-outline" size={16} color="#F57C1F" />
                <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Location</Text>
              </View>
              {!!request.address?.trim() && (
                <Text className="text-sm font-semibold text-gray-800">{request.address}</Text>
              )}
              {!!request.city?.trim() && (
                <Text className="text-sm text-gray-500 mt-0.5">{request.city}</Text>
              )}
            </View>
          )}

          {/* ── 11. Bids info (open requests) ── */}
          {request.request_type === 'open' && (
            <View className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-base font-bold text-blue-900 mb-0.5">
                    {request.bid_count ?? 0} {(request.bid_count ?? 0) === 1 ? 'Bid' : 'Bids'} Received
                  </Text>
                  <Text className="text-xs text-blue-600">
                    {(request.bid_count ?? 0) === 0
                      ? 'Waiting for providers to submit bids'
                      : 'Review and accept the best bid'}
                  </Text>
                </View>
                {(request.bid_count ?? 0) > 0 && (
                  <TouchableOpacity
                    onPress={() => Alert.alert('Coming Soon', 'Bids list coming soon!')}
                    className="bg-blue-500 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white font-bold text-xs">View Bids</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

        </View>
        <View className="h-28" />
      </ScrollView>

      {/* Action Buttons */}
      {(request.status === 'open' || request.status === 'rejected') && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
          {request.status === 'open' && (
            <TouchableOpacity
              onPress={handleCloseRequest}
              disabled={isClosing}
              className="bg-red-500 py-4 rounded-xl items-center"
              activeOpacity={0.8}
            >
              {isClosing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Close Request</Text>
              )}
            </TouchableOpacity>
          )}

          {request.status === 'rejected' && (
            <View className="gap-3">
              {isEditing ? (
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 dark:bg-[#334155] py-4 rounded-xl items-center"
                    activeOpacity={0.8}
                  >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold text-base">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    disabled={isSaving}
                    className="flex-1 bg-primary-500 py-4 rounded-xl items-center"
                    activeOpacity={0.8}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold text-base">Submit</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setEditDescription(request.description);
                    setIsEditing(true);
                  }}
                  className="bg-primary-500 py-4 rounded-xl items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-base">Edit &amp; Resubmit</Text>
                </TouchableOpacity>
              )}
              {!isEditing && (
                <TouchableOpacity
                  onPress={handleCloseRequest}
                  disabled={isClosing}
                  className="bg-red-500 py-4 rounded-xl items-center"
                  activeOpacity={0.8}
                >
                  {isClosing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">Close Request</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
