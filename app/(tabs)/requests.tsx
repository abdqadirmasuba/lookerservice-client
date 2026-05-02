import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import {
  setRequests,
  appendRequests,
  setRequestsLoading,
  resetPagination,
  updateRequest,
} from '../../src/store/slices/requestsSlice';
import { formatRelativeTime } from '../../src/utils/formatters';
import { apiRequests } from '@/src/utils/apiRequests';
import type { ServiceRequest } from '@/src/types';

function getBusinessInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

type StatusConfig = { label: string; bg: string; text: string; dot: string };

const STATUS_CONFIG: Record<string, StatusConfig> = {
  open:        { label: 'Open',        bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  responded:   { label: 'Accepted',    bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  rejected:    { label: 'Rejected',    bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E' },
  closed:      { label: 'Closed',      bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF' },
  cancelled:   { label: 'Cancelled',   bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF' },
  in_progress: { label: 'In Progress', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B' },
  completed:   { label: 'Completed',   bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
};

export default function RequestsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { requests, isLoading, hasMore, offset, limit } = useAppSelector(
    (state) => state.requests
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) loadRequests(true);
  }, [isAuthenticated]);

  const loadRequests = async (reset = false) => {
    try {
      if (reset) {
        dispatch(setRequestsLoading(true));
        dispatch(resetPagination());
      }
      const currentOffset = reset ? 0 : offset;
      const response = await apiRequests.get(
        `/client/service-requests?limit=${limit}&offset=${currentOffset}`
      );
      if (response.data.success) {
        if (reset) {
          dispatch(setRequests(response.data.data));
        } else {
          dispatch(appendRequests(response.data.data));
        }
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      dispatch(setRequestsLoading(false));
    }
  };

  const handleClose = (request: ServiceRequest) => {
    Alert.alert(
      'Close Request',
      'Are you sure you want to close this request? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            setClosingId(request.id);
            try {
              await apiRequests.post(`/client/service-requests/${request.id}/close`, {});
              dispatch(updateRequest({ ...request, status: 'closed' }));
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to close request');
            } finally {
              setClosingId(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests(true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || isLoading) return;
    setLoadingMore(true);
    await loadRequests(false);
    setLoadingMore(false);
  };

  if (isLoading && requests.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#F57C1F" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>
            Loading requests…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>My Requests</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 32 }}>📋</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
            Sign In to View Requests
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
            Log in to post service requests and receive bids from providers.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{ width: '100%', backgroundColor: '#2DA9E9', borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginBottom: 12 }}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{ width: '100%', borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' }}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 15 }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 14,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827' }}>My Requests</Text>
        {requests.length > 0 && (
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
            {requests.length} request{requests.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F57C1F" />
        }
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={handleLoadMore}
      >
        {requests.length === 0 ? (
          /* ── Empty state ── */
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FFF3E0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 36 }}>📋</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
              No requests yet
            </Text>
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 24,
                paddingHorizontal: 24,
              }}
            >
              Browse services and send your first request to a provider
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(explore)/explore')}
              style={{
                backgroundColor: '#F57C1F',
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 14,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Explore Services
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          requests.map((request) => {
            const cfg: StatusConfig = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.closed;
            const isClosingThis = closingId === request.id;
            const canClose = request.status === 'open' || request.status === 'rejected';
            const canEdit = request.status === 'rejected';
            const businessName = request.business_name ?? 'Unknown';
            const initials = getBusinessInitials(businessName);
            const serviceNames = request.service_names ?? [];

            return (
              <TouchableOpacity
                key={request.id}
                onPress={() => router.push(`/(service-request)/${request.id}`)}
                activeOpacity={0.75}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: '#F3F4F6',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                  overflow: 'hidden',
                }}
              >
                {/* Colour-coded accent strip */}
                <View style={{ height: 3, backgroundColor: cfg.dot }} />

                <View style={{ padding: 16 }}>
                  {/* ── Row: logo + info + badge ── */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    {/* Business logo or initials */}
                    {request.business_logo ? (
                      <Image
                        source={{ uri: request.business_logo }}
                        style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          marginRight: 12,
                          backgroundColor: '#FFF3E0',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#F57C1F' }}>
                          {initials}
                        </Text>
                      </View>
                    )}

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: '700',
                            fontSize: 15,
                            color: '#111827',
                            flex: 1,
                            marginRight: 10,
                          }}
                          numberOfLines={1}
                        >
                          {businessName}
                        </Text>

                        {/* Status badge */}
                        <View
                          style={{
                            backgroundColor: cfg.bg,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: cfg.dot,
                              marginRight: 5,
                            }}
                          />
                          <Text style={{ fontSize: 12, fontWeight: '600', color: cfg.text }}>
                            {cfg.label}
                          </Text>
                        </View>
                      </View>

                      {/* Service names */}
                      {serviceNames.length > 0 && (
                        <Text
                          style={{
                            color: '#6B7280',
                            fontSize: 13,
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                          numberOfLines={2}
                        >
                          {serviceNames.join(' · ')}
                        </Text>
                      )}

                      {/* Request # + time */}
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}
                      >
                        <Text style={{ color: '#D1D5DB', fontSize: 11 }}>
                          {request.request_number}
                        </Text>
                        <Text style={{ color: '#E5E7EB', marginHorizontal: 6 }}>·</Text>
                        <Text style={{ color: '#D1D5DB', fontSize: 11 }}>
                          {formatRelativeTime(request.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Rejected: inline warning note */}
                  {request.status === 'rejected' && (
                    <View
                      style={{
                        marginTop: 12,
                        backgroundColor: '#FFF1F2',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, marginRight: 6 }}>⚠️</Text>
                      <Text style={{ fontSize: 12, color: '#9F1239', flex: 1, lineHeight: 16 }}>
                        Your request was rejected. Edit &amp; resubmit or close it.
                      </Text>
                    </View>
                  )}

                  {/* Responded: booking created note */}
                  {request.status === 'responded' && (
                    <View
                      style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: '#F0FDF4',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ flex: 1, fontSize: 12, color: '#9CA3AF' }}>
                        {request.request_type === 'direct' ? '👤 Direct' : '📢 Open Request'}
                      </Text>
                      <View
                        style={{
                          backgroundColor: '#F0FDF4',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13 }}>✅</Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#15803D',
                            fontWeight: '600',
                            marginLeft: 5,
                          }}
                        >
                          Booking created
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action buttons row (open + rejected) */}
                  {(canClose || canEdit) && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 14,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: '#F9FAFB',
                      }}
                    >
                      <Text style={{ flex: 1, fontSize: 12, color: '#9CA3AF' }}>
                        {request.request_type === 'direct' ? '👤 Direct' : '📢 Open Request'}
                      </Text>

                      {canEdit && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            router.push(`/(service-request)/${request.id}`);
                          }}
                          style={{
                            borderWidth: 1.5,
                            borderColor: '#F57C1F',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 7,
                            marginRight: 8,
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 13, color: '#F57C1F', fontWeight: '600' }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      )}

                      {canClose && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleClose(request);
                          }}
                          disabled={isClosingThis}
                          style={{
                            backgroundColor: '#FFF1F2',
                            borderRadius: 8,
                            paddingHorizontal: 16,
                            paddingVertical: 7,
                          }}
                          activeOpacity={0.7}
                        >
                          {isClosingThis ? (
                            <ActivityIndicator size="small" color="#BE123C" />
                          ) : (
                            <Text style={{ fontSize: 13, color: '#BE123C', fontWeight: '600' }}>
                              Close
                            </Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Load More */}
        {hasMore && !isLoading && requests.length > 0 && (
          <TouchableOpacity
            onPress={handleLoadMore}
            disabled={loadingMore}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              marginTop: 4,
            }}
            activeOpacity={0.7}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#F57C1F" />
            ) : (
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Load More</Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(explore)/explore')}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          backgroundColor: '#F57C1F',
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#F57C1F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#fff', fontSize: 28, lineHeight: 32, marginTop: -2 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
