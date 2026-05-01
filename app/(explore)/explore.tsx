import { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiRequests } from '@/src/utils/apiRequests';
import { useDebounce } from '@/src/hooks';
import SvgIcon from '@/src/componets/common/SvgIcon';

const ORANGE = '#F57C1F';

interface Group {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  sort_order: number;
}

interface ServiceResult {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  sort_order: number;
  category_id: string;
  category_name: string;
  group_id: string;
  group_name: string;
}

// ─── Service Search Modal ─────────────────────────────────────────────────────
function ServiceSearchModal({
  visible,
  onClose,
  onSelectService,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectService: (service: ServiceResult) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!visible) { setQuery(''); setResults([]); }
    else { setTimeout(() => inputRef.current?.focus(), 200); }
  }, [visible]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    let cancelled = false;
    setIsSearching(true);
    apiRequests
      .get('/client/services', { query: debouncedQuery.trim(), limit: 10 })
      .then((res) => {
        if (!cancelled && res.data.success) setResults(res.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsSearching(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#F9FAFB' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.searchHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.searchInputRow}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="What service do you need?"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {isSearching ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={ORANGE} />
            <Text style={{ color: '#9CA3AF', marginTop: 10, fontSize: 13 }}>Searching...</Text>
          </View>
        ) : query.trim() === '' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
              Start typing to search services
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
              e.g. "plumbing", "cleaning", "tutoring"
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>😕</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
              No services found
            </Text>
            <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
              Try a different keyword
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectService(item)}
                activeOpacity={0.8}
                style={styles.serviceResultCard}
              >
                <View style={styles.serviceResultIcon}>
                  <SvgIcon uri={item.icon_url} size={30} fallback="⚙️" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceResultName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.serviceResultDesc} numberOfLines={2}>{item.description}</Text>
                  <Text style={styles.serviceResultMeta} numberOfLines={1}>
                    {item.category_name}  ·  {item.group_name}
                  </Text>
                </View>
                <View style={styles.findBadge}>
                  <Text style={styles.findBadgeText}>Find</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 m-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 items-center min-h-[120px] justify-center"
    >
      <View className="w-14 h-14 rounded-xl bg-blue-50 items-center justify-center mb-3">
        <SvgIcon uri={group.icon_url} size={36} fallback="🛠️" />
      </View>
      <Text className="text-sm font-semibold text-gray-800 text-center leading-4" numberOfLines={2}>
        {group.name}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ExploreScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchGroups = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequests.get('/client/groups');
      if (res.data.success) {
        const data = res.data.data as Group[];
        setGroups([...data].sort((a, b) => a.sort_order - b.sort_order));
      } else {
        setError(res.data.message || 'Failed to load services');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load services. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const onRefresh = () => { setRefreshing(true); fetchGroups(); };

  const handleSelectService = (service: ServiceResult) => {
    setShowSearch(false);
    router.push({
      pathname: '/(explore)/providers',
      params: { service_id: service.id, service_name: service.name },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2DA9E9" />
        <Text className="text-gray-400 mt-3 text-sm">Loading services...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Find a Service</Text>
          <Text style={styles.headerSubtitle}>
            Browse categories or search for what you need
          </Text>
        </View>
      </View>

      {/* Search tap target */}
      <TouchableOpacity
        onPress={() => setShowSearch(true)}
        activeOpacity={0.85}
        style={styles.searchTrigger}
      >
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <Text style={styles.searchTriggerText}>Search any service...</Text>
        <View style={styles.searchTriggerBadge}>
          <Text style={styles.searchTriggerBadgeText}>Search</Text>
        </View>
      </TouchableOpacity>

      {error ? (
        <View className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Text className="text-red-600 text-sm text-center">{error}</Text>
          <TouchableOpacity onPress={fetchGroups} className="mt-2">
            <Text className="text-red-700 font-semibold text-sm text-center">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DA9E9" />
        }
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() =>
              router.push({
                pathname: '/(explore)/categories',
                params: { group_id: item.id, group_name: item.name },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-5xl mb-3">🔍</Text>
            <Text className="text-gray-500 font-medium">No service types available</Text>
          </View>
        }
      />

      <ServiceSearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectService={handleSelectService}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchTriggerText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchTriggerBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  searchTriggerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  cancelBtn: {
    marginLeft: 12,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 15,
    color: ORANGE,
    fontWeight: '600',
  },
  serviceResultCard: {
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
  serviceResultIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  serviceResultName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  serviceResultDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
  serviceResultMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  findBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
    flexShrink: 0,
  },
  findBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
