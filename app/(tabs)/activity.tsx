import { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequests } from '@/src/utils/apiRequests';
import { useAppSelector } from '@/src/store/hooks';

const ORANGE = '#F57C1F';

interface ViewedProvider {
  provider_id: string;
  business_name: string;
  city?: string;
  average_rating: number;
  total_reviews: number;
  viewed_at: string;
  profile_image?: string;
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const stars = Array.from({ length: 5 }, (_, i) => i < full ? '★' : '☆');
  return (
    <Text style={{ color: '#FBBF24', fontSize: 12, letterSpacing: 1 }}>
      {stars.join('')}
    </Text>
  );
}

export default function ActivityScreen() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [providers, setProviders] = useState<ViewedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setError('');
    try {
      const res = await apiRequests.get('/client/viewed-providers');
      if (res.data.success) {
        setProviders(res.data.data ?? []);
      } else {
        setError(res.data.message || 'Failed to load history');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load history. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { if (isAuthenticated) fetchHistory(); else setIsLoading(false); }, [fetchHistory, isAuthenticated]);

  const onRefresh = () => { setRefreshing(true); fetchHistory(); };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Activity</Text>
          <Text style={styles.headerSubtitle}>Providers you've recently viewed</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF8FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="time-outline" size={34} color="#2DA9E9" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
            Sign In to View Activity
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
            Log in to see the providers you've recently browsed.
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activity</Text>
        <Text style={styles.headerSubtitle}>Providers you've recently viewed</Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        onPress={() => router.push('/(explore)/explore')}
        activeOpacity={0.85}
        style={styles.cta}
      >
        <View style={styles.ctaIcon}>
          <Ionicons name="search" size={22} color={ORANGE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Find a Service</Text>
          <Text style={styles.ctaSubtitle}>Browse categories and discover providers</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={ORANGE} />
      </TouchableOpacity>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#2DA9E9" />
          <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 13 }}>Loading history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchHistory} style={{ marginTop: 8 }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item, index) => `${item.provider_id}-${index}`}
          contentContainerStyle={providers.length === 0 ? { flex: 1 } : { padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
          }
          ListHeaderComponent={
            providers.length > 0 ? (
              <Text style={styles.sectionLabel}>Recent Providers</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👀</Text>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptySubtitle}>
                Providers you view will appear here so you can find them again easily.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(explore)/explore')}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Browse Services</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/(providers)/[id]/profile',
                  params: { id: item.provider_id },
                })
              }
              activeOpacity={0.8}
              style={styles.card}
            >
              {/* Avatar placeholder */}
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#9CA3AF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.business_name}
                </Text>
                {item.city ? (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                    <Text style={styles.cardCity} numberOfLines={1}>{item.city}</Text>
                  </View>
                ) : null}
                <View style={styles.ratingRow}>
                  <StarRating rating={item.average_rating} />
                  <Text style={styles.reviewCount}>
                    {' '}({item.total_reviews})
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.viewedAt}>{formatDate(item.viewed_at)}</Text>
                <View style={styles.viewBadge}>
                  <Text style={styles.viewBadgeText}>View</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  ctaSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cardCity: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  viewedAt: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  viewBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  viewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  errorBox: {
    margin: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
  },
  retryText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: ORANGE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
