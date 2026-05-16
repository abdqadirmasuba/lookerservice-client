import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { apiRequests } from '@/src/utils/apiRequests';
import SvgIcon from '@/src/componets/common/SvgIcon';

const BLUE = '#2DA9E9';
const ORANGE = '#F57C1F';
const VISIBLE_COUNT = 4;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ServiceListItem {
  label: string;
  amount?: number;
  currency?: string;
  image_urls?: string[];
}

interface ProviderInfoService {
  provider_service_id: string;
  service_id: string;
  service_name: string;
  service_list: ServiceListItem[];
  service_icon_url: string;
}

interface ProviderInfo {
  id: string;
  business_name: string;
  average_rating: number;
  total_reviews: number;
  availability_status: string;
  is_verified: boolean;
  service_delivery_type: string;
  services: ProviderInfoService[];
}

interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function availabilityMeta(status: string) {
  if (status === 'available') return { label: 'Available', color: '#16A34A', bg: '#DCFCE7' };
  if (status === 'busy') return { label: 'Busy', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Unavailable', color: '#6B7280', bg: '#F3F4F6' };
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Image Viewer Modal ───────────────────────────────────────────────────────
function ImageViewerModal({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Counter */}
        <View style={{ position: 'absolute', top: insets.top + 14, left: 0, right: 0, alignItems: 'center', zIndex: 10 }}>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{index + 1} / {images.length}</Text>
        </View>
        {/* Close */}
        <View style={{ position: 'absolute', top: insets.top + 10, right: 14, zIndex: 10 }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Image */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={{ uri: images[index] }}
            style={{ width: '100%', height: '80%' }}
            resizeMode="contain"
          />
        </View>
        {/* Prev */}
        {index > 0 && (
          <View style={{ position: 'absolute', top: '50%', left: 12, marginTop: -20 }}>
            <TouchableOpacity
              onPress={() => setIndex((i) => i - 1)}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        {/* Next */}
        {index < images.length - 1 && (
          <View style={{ position: 'absolute', top: '50%', right: 12, marginTop: -20 }}>
            <TouchableOpacity
              onPress={() => setIndex((i) => i + 1)}
              style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Service Detail Modal ─────────────────────────────────────────────────────
function ServiceDetailModal({
  service,
  selectedItems,
  onToggleItem,
  onClose,
  onOpenImage,
}: {
  service: ProviderInfoService;
  selectedItems: ServiceListItem[];
  onToggleItem: (item: ServiceListItem) => void;
  onClose: () => void;
  onOpenImage: (images: string[], index: number) => void;
}) {
  return (
    <Modal visible animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }} numberOfLines={2}>
                {service.service_name}
              </Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                {service.service_list.length} item{service.service_list.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
          {/* Items */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
            {service.service_list.map((item, idx) => {
              const isItemSelected = selectedItems.some((s) => s.label === item.label);
              return (
                <View key={idx}>
                  {/* Item header */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => onToggleItem(item)}
                      style={{
                        width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                        borderColor: isItemSelected ? ORANGE : '#D1D5DB',
                        backgroundColor: isItemSelected ? ORANGE : '#F9FAFB',
                        alignItems: 'center', justifyContent: 'center',
                        marginRight: 10, marginTop: 1, flexShrink: 0,
                      }}
                    >
                      {isItemSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{item.label}</Text>
                      {item.amount !== undefined && (
                        <Text style={{ fontSize: 12, color: ORANGE, fontWeight: '700', marginTop: 2 }}>
                          {item.currency ?? 'UGX'} {item.amount.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </View>
                  {/* Images */}
                  {item.image_urls && item.image_urls.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {item.image_urls.map((uri, imgIdx) => (
                          <TouchableOpacity
                            key={imgIdx}
                            onPress={() => onOpenImage(item.image_urls!, imgIdx)}
                            activeOpacity={0.85}
                            style={{ marginRight: 8 }}
                          >
                            <Image
                              source={{ uri }}
                              style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: '#F3F4F6' }}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                  {/* Divider */}
                  {idx < service.service_list.length - 1 && (
                    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 }} />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Map Picker Modal ─────────────────────────────────────────────────────────
function MapPickerModal({
  initialLat, initialLng, onConfirm, onCancel,
}: {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState({ lat: initialLat, lng: initialLng });

  const region: Region = {
    latitude: pin.lat || 0.3155,
    longitude: pin.lng || 32.5822,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <Modal visible animationType="slide" statusBarTranslucent>
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center justify-between bg-white px-4 pb-3 border-b border-gray-100"
          style={{ paddingTop: insets.top + 8 }}
        >
          <TouchableOpacity
            onPress={onCancel}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="close" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900">Set Location</Text>
          <View className="w-10" />
        </View>

        <View className="flex-row items-center bg-yellow-50 px-4 py-2 gap-1.5">
          <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
          <Text className="text-xs text-gray-500">Tap the map to place your pin</Text>
        </View>

        <MapView
          style={{ flex: 1 }}
          initialRegion={region}
          onPress={(e: MapPressEvent) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setPin({ lat: latitude, lng: longitude });
          }}
        >
          <Marker
            coordinate={{ latitude: pin.lat || 0.3155, longitude: pin.lng || 32.5822 }}
            pinColor={ORANGE}
          />
        </MapView>

        <View
          className="bg-white px-4 pt-3.5 border-t border-gray-100 flex-row items-center gap-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <Text className="flex-1 text-xs text-gray-500 font-medium">
            {pin.lat.toFixed(5)},  {pin.lng.toFixed(5)}
          </Text>
          <TouchableOpacity
            onPress={() => onConfirm(pin.lat, pin.lng)}
            className="flex-row items-center bg-tertiary-500 px-4 py-3 rounded-2xl"
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text className="text-white font-bold text-sm">Use This Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Option Row ───────────────────────────────────────────────────────────────
function OptionRow({
  icon, iconBg, iconColor, label, summary, enabled, onToggle, children,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  summary?: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <View className={`border-b border-gray-100 ${enabled ? 'bg-gray-50' : 'bg-white'}`}>
      <View className="flex-row items-center px-3.5 py-3.5">
        <View
          className="w-8 h-8 rounded-[10px] items-center justify-center mr-3"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon as any} size={17} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800">{label}</Text>
          {summary ? (
            <Text className="text-[11px] text-gray-400 mt-0.5" numberOfLines={1}>{summary}</Text>
          ) : null}
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: ORANGE + '70' }}
          thumbColor={enabled ? ORANGE : '#D1D5DB'}
          ios_backgroundColor="#E5E7EB"
        />
      </View>
      {enabled && children ? (
        <View className="px-3.5 pb-3.5">{children}</View>
      ) : null}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProviderRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, service_id } = useLocalSearchParams<{ id: string; service_id?: string }>();

  const [info, setInfo] = useState<ProviderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Record<string, ServiceListItem[]>>({});
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [detailService, setDetailService] = useState<ProviderInfoService | null>(null);
  const [imageViewer, setImageViewer] = useState<{ images: string[]; index: number } | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Optional toggles & values
  const [descEnabled, setDescEnabled] = useState(false);
  const [description, setDescription] = useState('');

  const [prefDateEnabled, setPrefDateEnabled] = useState(false);
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);

  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [locationSet, setLocationSet] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  const [photosEnabled, setPhotosEnabled] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);

  // Shared date picker state
  const [datePickerFor, setDatePickerFor] = useState<'preferred' | 'deadline' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [androidPickerStep, setAndroidPickerStep] = useState<'date' | 'time'>('date');

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchInfo = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequests.get(`/client/providers/${id}/info`);
      if (res.data.success) {
        const data: ProviderInfo = res.data.data;
        setInfo(data);
        if (service_id) {
          const matched = data.services.find((s) => s.service_id === service_id);
          if (matched) {
            setSelected(new Set([matched.provider_service_id]));
            setExpandedServices(new Set([matched.provider_service_id]));
          }
        }
      } else {
        setError(res.data.message || 'Failed to load provider info');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load provider info');
    } finally {
      setIsLoading(false);
    }
  }, [id, service_id]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleService = (psid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(psid)) {
        next.delete(psid);
        setSelectedItems((si) => { const n = { ...si }; delete n[psid]; return n; });
      } else {
        next.add(psid);
      }
      return next;
    });
  };

  const toggleItem = (psid: string, item: ServiceListItem) => {
    setSelected((prev) => { const n = new Set(prev); n.add(psid); return n; });
    setSelectedItems((prev) => {
      const existing = prev[psid] ?? [];
      const idx = existing.findIndex((i) => i.label === item.label);
      if (idx >= 0) return { ...prev, [psid]: existing.filter((_, i) => i !== idx) };
      return { ...prev, [psid]: [...existing, item] };
    });
  };

  const toggleExpanded = (psid: string) => {
    setExpandedServices((prev) => {
      const n = new Set(prev);
      if (n.has(psid)) n.delete(psid); else n.add(psid);
      return n;
    });
  };

  const handleLocationToggle = async (val: boolean) => {
    setLocationEnabled(val);
    if (val && !locationSet) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLatitude(loc.coords.latitude);
          setLongitude(loc.coords.longitude);
          setLocationSet(true);
        }
      } catch (_) {}
    }
  };

  const openDatePicker = (field: 'preferred' | 'deadline') => {
    const current = field === 'preferred' ? (preferredDate ?? new Date()) : (deadlineDate ?? new Date());
    setTempDate(current);
    setDatePickerFor(field);
  };

  const pickImages = async (source: 'gallery' | 'camera') => {
    const result = source === 'gallery'
      ? await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsMultipleSelection: true,
          quality: 0.8,
        })
      : await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled) {
      const next: PickedImage[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? a.uri.split('/').pop() ?? 'photo.jpg',
        type: a.mimeType ?? 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...next]);
    }
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((i) => i.uri !== uri));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (photosEnabled && images.length > 0) {
        try {
          imageUrls = await Promise.all(
            images.map(async (img) => {
              // 1. Get a presigned S3 upload URL
              const presignRes = await apiRequests.post('/client/uploads/presign', {
                file_name: img.name,
                content_type: img.type,
                upload_type: 'request_image',
              });
              if (!presignRes.data.success) {
                throw new Error(presignRes.data.message || 'Failed to get upload URL');
              }
              const { upload_url, public_url } = presignRes.data.data as {
                upload_url: string;
                public_url: string;
              };

              // 2. Read the local image as a blob
              const fileRes = await fetch(img.uri);
              const blob = await fileRes.blob();

              // 3. Upload directly to S3 via the presigned PUT URL
              await apiRequests.uploadToS3(upload_url, blob, img.type);

              return public_url;
            }),
          );
        } catch (upErr: any) {
          console.error('Image upload error:', upErr.response);

          Alert.alert('Upload Failed', upErr.message || 'Could not upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const payload: Record<string, any> = {
        target_provider_id: id,
        provider_services: Array.from(selected).map((psid) => ({
          id: psid,
          items: (selectedItems[psid] ?? []).map(({ label, amount, currency }) => ({
            label,
            ...(amount !== undefined && { amount }),
            ...(currency !== undefined && { currency }),
          })),
        })),
        latitude: locationEnabled && locationSet ? latitude : 0,
        longitude: locationEnabled && locationSet ? longitude : 0,
      };
      if (descEnabled && description.trim()) payload.description = description.trim();
      if (prefDateEnabled && preferredDate) payload.preferred_date = preferredDate.toISOString();
      if (deadlineEnabled && deadlineDate) payload.deadline = deadlineDate.toISOString();
      if (budgetEnabled) {
        const mn = parseFloat(budgetMin);
        const mx = parseFloat(budgetMax);
        if (!isNaN(mn)) payload.budget_min = mn;
        if (!isNaN(mx)) payload.budget_max = mx;
      }
      if (imageUrls.length > 0) payload.images = imageUrls;

      const res = await apiRequests.post('/client/service-requests/direct', payload);
      if (res.data.success) {
        Alert.alert(
          'Request Sent! 🎉',
          `Your request has been sent to ${info?.business_name}. They will review it shortly.`,
          [
            { text: 'View Requests', onPress: () => router.replace('/(tabs)/requests') },
            { text: 'Go Home', onPress: () => router.replace('/(tabs)/home'), style: 'cancel' },
          ],
        );
      } else {
        throw new Error(res.data.message || 'Failed to submit');
      }
    } catch (err: any) {
      console.error('Submission error:', err.response?.data);
      Alert.alert('Submission Failed', err.response?.data?.message || err.message || 'Could not submit your request.');

    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-[17px] font-bold text-gray-900">Request Service</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BLUE} />
          <Text className="text-gray-400 mt-2.5 text-[13px]">Loading provider info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !info) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-[17px] font-bold text-gray-900">Request Service</Text>
          <View className="w-6" />
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-[38px] mb-3">⚠️</Text>
          <Text className="text-[15px] font-bold text-gray-700 text-center mb-4">
            {error || 'Provider not found'}
          </Text>
          <TouchableOpacity
            onPress={fetchInfo}
            className="bg-tertiary-500 px-6 py-3 rounded-3xl"
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const avail = availabilityMeta(info.availability_status);
  const matchedPsid = service_id
    ? info.services.find((s) => s.service_id === service_id)?.provider_service_id
    : null;
  const selectedList = info.services.filter((s) => selected.has(s.provider_service_id));
  const primarySelected =
    matchedPsid && selected.has(matchedPsid)
      ? info.services.find((s) => s.provider_service_id === matchedPsid)
      : selectedList[0] ?? null;
  const displayedServices = showAll ? info.services : info.services.slice(0, VISIBLE_COUNT);
  const canSubmit = selected.size > 0 && !isSubmitting;

  const descSummary = descEnabled && description ? `${description.length} chars` : 'Optional notes for the provider';
  const prefDateSummary = prefDateEnabled && preferredDate ? formatDate(preferredDate) : 'Not set';
  const deadlineSummary = deadlineEnabled && deadlineDate ? formatDate(deadlineDate) : 'Not set';
  const locationSummary = locationEnabled && locationSet
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    : 'Where do you need this done?';
  const budgetSummary = budgetEnabled && (budgetMin || budgetMax)
    ? `${budgetMin || '0'} – ${budgetMax || '∞'}`
    : 'Set a min / max budget';
  const photosSummary = photosEnabled && images.length > 0
    ? `${images.length} photo${images.length !== 1 ? 's' : ''} added`
    : 'Add photos of the issue';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-gray-900">Provider Request</Text>
        <View className="w-6" />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Provider Snapshot ───────────────────────────────────────── */}
          <View className="flex-row items-center bg-white mx-4 mt-4 rounded-[20px] p-4 border border-blue-100 shadow-sm">
            <View className="w-[52px] h-[52px] rounded-[14px] bg-blue-50 items-center justify-center mr-3.5 border-[1.5px] border-blue-200">
              <Ionicons name="storefront-outline" size={28} color={BLUE} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-start">
                <Text className="text-base font-extrabold text-gray-900 flex-1 mr-1.5" numberOfLines={2}>
                  {info.business_name}
                </Text>
                {info.is_verified && (
                  <View className="flex-row items-center bg-blue-50 px-1.5 py-0.5 rounded-full mt-0.5 gap-1">
                    <Ionicons name="checkmark-circle" size={13} color={BLUE} />
                    <Text className="text-[10px] text-primary-500 font-bold">Verified</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center mt-2 gap-2">
                <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
                  <Text className="text-xs font-bold text-yellow-800">★ {info.average_rating.toFixed(1)}</Text>
                  <Text className="text-[11px] text-gray-400"> ({info.total_reviews})</Text>
                </View>
                <View className="px-2 py-1 rounded-full" style={{ backgroundColor: avail.bg }}>
                  <Text className="text-[11px] font-semibold" style={{ color: avail.color }}>
                    {avail.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Selected Service Pill ────────────────────────────────────── */}
          {primarySelected && (
            <View className="mx-4 mt-5">
              <Text className="text-[15px] font-extrabold text-gray-900 mb-1">Selected Service</Text>
              <View className="flex-row items-center bg-blue-50 border-[1.5px] border-blue-200 rounded-2xl px-3.5 py-2.5">
                <View className="w-[30px] h-[30px] rounded-[8px] bg-white items-center justify-center mr-2.5">
                  <SvgIcon uri={primarySelected.service_icon_url} size={20} fallback="⚙️" />
                </View>
                <Text className="flex-1 text-sm font-bold text-blue-700" numberOfLines={1}>
                  {primarySelected.service_name}
                </Text>
                {selected.size > 1 && (
                  <View className="bg-tertiary-500 px-2 py-0.5 rounded-xl">
                    <Text className="text-white text-[11px] font-bold">+{selected.size - 1}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Service Selection ────────────────────────────────────────── */}
          <View className="mx-4 mt-5">
            <Text className="text-[15px] font-extrabold text-gray-900 mb-1">
              {service_id ? 'Add More Services' : 'Select Services'}
            </Text>
            <Text className="text-xs text-gray-400 mb-3">
              {service_id
                ? 'Optionally add other services from this provider'
                : 'Choose one or more services to request'}
            </Text>
            <View className="rounded-2xl overflow-hidden border border-gray-100">
              {displayedServices.map((svc) => {
                const checked = selected.has(svc.provider_service_id);
                const isExpanded = expandedServices.has(svc.provider_service_id);
                const isPrimary = svc.provider_service_id === matchedPsid;
                const svcItems = selectedItems[svc.provider_service_id] ?? [];
                return (
                  <View key={svc.provider_service_id}>
                    {/* Service header row */}
                    <TouchableOpacity
                      onPress={() => toggleService(svc.provider_service_id)}
                      activeOpacity={0.8}
                      className={`flex-row items-center px-3.5 py-3 border-b ${
                        checked ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-50'
                      }`}
                    >
                      <View
                        className={`w-[21px] h-[21px] rounded-[6px] border-2 items-center justify-center mr-3 shrink-0 ${
                          checked ? 'bg-tertiary-500 border-tertiary-500' : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        {checked && <Ionicons name="checkmark" size={13} color="#fff" />}
                      </View>
                      <View className="w-9 h-9 rounded-[10px] bg-orange-50 items-center justify-center mr-3 shrink-0">
                        <SvgIcon uri={svc.service_icon_url} size={22} fallback="⚙️" />
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text
                            className={`text-[13px] font-semibold flex-1 ${checked ? 'text-gray-900' : 'text-gray-700'}`}
                            numberOfLines={1}
                          >
                            {svc.service_name}
                          </Text>
                          {isPrimary && (
                            <View className="bg-blue-50 px-1.5 py-0.5 rounded-[10px] ml-1.5">
                              <Text className="text-[10px] text-primary-500 font-bold">Selected</Text>
                            </View>
                          )}
                        </View>
                        {svcItems.length > 0 && (
                          <Text className="text-[11px] text-tertiary-500 font-medium mt-0.5">
                            {svcItems.length} item{svcItems.length !== 1 ? 's' : ''} selected
                          </Text>
                        )}
                      </View>
                      {/* Info popup */}
                      <TouchableOpacity
                        onPress={() => setDetailService(svc)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mx-2"
                      >
                        <Ionicons name="information-circle-outline" size={17} color={BLUE} />
                      </TouchableOpacity>
                      {/* Expand toggle */}
                      <TouchableOpacity
                        onPress={() => toggleExpanded(svc.provider_service_id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {/* Expanded items */}
                    {isExpanded && svc.service_list.length > 0 && (
                      <View className="bg-gray-50 border-b border-gray-100">
                        {svc.service_list.map((item, itemIdx) => {
                          const isItemSelected = svcItems.some((s) => s.label === item.label);
                          return (
                            <TouchableOpacity
                              key={itemIdx}
                              onPress={() => toggleItem(svc.provider_service_id, item)}
                              activeOpacity={0.75}
                              className={`flex-row items-center py-2.5 px-3.5 ml-10 border-b border-gray-100/80 ${
                                isItemSelected ? 'bg-orange-50' : ''
                              }`}
                            >
                              <View
                                className={`w-[18px] h-[18px] rounded-[5px] border-2 items-center justify-center mr-3 shrink-0 ${
                                  isItemSelected ? 'bg-tertiary-500 border-tertiary-500' : 'bg-white border-gray-300'
                                }`}
                              >
                                {isItemSelected && <Ionicons name="checkmark" size={11} color="#fff" />}
                              </View>
                              <View className="flex-1">
                                <Text className={`text-[12px] font-medium ${isItemSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {item.label}
                                </Text>
                                {item.amount !== undefined && (
                                  <Text className="text-[11px] text-tertiary-500 font-semibold mt-0.5">
                                    {item.currency ?? 'UGX'} {item.amount.toLocaleString()}
                                  </Text>
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
            {info.services.length > VISIBLE_COUNT && (
              <TouchableOpacity
                onPress={() => setShowAll((v) => !v)}
                className="flex-row items-center justify-center py-3 bg-white border border-t-0 border-gray-100 rounded-b-2xl gap-1"
                activeOpacity={0.75}
              >
                <Text className="text-tertiary-500 text-[13px] font-semibold">
                  {showAll ? 'Show fewer' : `See all ${info.services.length} services`}
                </Text>
                <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={15} color={ORANGE} />
              </TouchableOpacity>
            )}
          </View>

          {/* ── Optional Details ────────────────────────────────────────── */}
          <View className="flex-row items-center mx-4 mt-7 mb-1">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wide px-2.5">
              Optional Details
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>
          <Text className="text-[11px] text-gray-400 text-center mb-3">
            All fields below are optional — toggle to add
          </Text>

          <View className="mx-4 rounded-[18px] overflow-hidden border border-gray-100">
            {/* Description */}
            <OptionRow
              icon="document-text-outline"
              iconBg="#F3F4F6"
              iconColor="#6B7280"
              label="Description"
              summary={descSummary}
              enabled={descEnabled}
              onToggle={setDescEnabled}
            >
              <TextInput
                className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 min-h-[90px]"
                placeholder="Describe your request in detail..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </OptionRow>

            {/* Preferred Date */}
            <OptionRow
              icon="calendar-outline"
              iconBg="#EFF6FF"
              iconColor={BLUE}
              label="Preferred Date"
              summary={prefDateSummary}
              enabled={prefDateEnabled}
              onToggle={setPrefDateEnabled}
            >
              <TouchableOpacity
                onPress={() => openDatePicker('preferred')}
                className="flex-row items-center bg-gray-50 border-[1.5px] border-blue-200 rounded-xl px-3 py-3 gap-2"
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={15} color={BLUE} />
                <Text className={`flex-1 text-[13px] font-medium ${preferredDate ? 'text-gray-700' : 'text-gray-400'}`}>
                  {preferredDate ? formatDate(preferredDate) : 'Tap to set preferred date & time'}
                </Text>
                <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            </OptionRow>

            {/* Deadline */}
            <OptionRow
              icon="hourglass-outline"
              iconBg="#FEF2F2"
              iconColor="#DC2626"
              label="Deadline"
              summary={deadlineSummary}
              enabled={deadlineEnabled}
              onToggle={setDeadlineEnabled}
            >
              <TouchableOpacity
                onPress={() => openDatePicker('deadline')}
                className="flex-row items-center bg-gray-50 border-[1.5px] border-red-300 rounded-xl px-3 py-3 gap-2"
                activeOpacity={0.8}
              >
                <Ionicons name="hourglass-outline" size={15} color="#DC2626" />
                <Text className={`flex-1 text-[13px] font-medium ${deadlineDate ? 'text-gray-700' : 'text-gray-400'}`}>
                  {deadlineDate ? formatDate(deadlineDate) : 'Tap to set a completion deadline'}
                </Text>
                <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
              </TouchableOpacity>
            </OptionRow>

            {/* Location */}
            <OptionRow
              icon="location-outline"
              iconBg="#FFF7ED"
              iconColor={ORANGE}
              label="Service Location"
              summary={locationSummary}
              enabled={locationEnabled}
              onToggle={handleLocationToggle}
            >
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                className="flex-row items-center bg-gray-50 border-[1.5px] border-orange-300 rounded-xl px-3 py-3 gap-2"
                activeOpacity={0.8}
              >
                <Ionicons name="map-outline" size={15} color={ORANGE} />
                <Text className={`flex-1 text-[13px] font-medium ${locationSet ? 'text-gray-700' : 'text-gray-400'}`}>
                  {locationSet
                    ? `${latitude.toFixed(5)},  ${longitude.toFixed(5)}`
                    : 'Tap to set location on map'}
                </Text>
                <Text className="text-xs text-tertiary-500 font-bold">
                  {locationSet ? 'Change' : 'Open Map'}
                </Text>
              </TouchableOpacity>
            </OptionRow>

            {/* Budget Range */}
            <OptionRow
              icon="cash-outline"
              iconBg="#F0FDF4"
              iconColor="#16A34A"
              label="Budget Range"
              summary={budgetSummary}
              enabled={budgetEnabled}
              onToggle={setBudgetEnabled}
            >
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <Text className="text-[11px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Minimum
                  </Text>
                  <TextInput
                    className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
                    placeholder="e.g. 50000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={budgetMin}
                    onChangeText={(v) => setBudgetMin(v.replace(/[^0-9.]/g, ''))}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">
                    Maximum
                  </Text>
                  <TextInput
                    className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
                    placeholder="e.g. 150000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={budgetMax}
                    onChangeText={(v) => setBudgetMax(v.replace(/[^0-9.]/g, ''))}
                  />
                </View>
              </View>
            </OptionRow>

            {/* Photos */}
            <OptionRow
              icon="images-outline"
              iconBg="#F5F3FF"
              iconColor="#7C3AED"
              label="Photos"
              summary={photosSummary}
              enabled={photosEnabled}
              onToggle={setPhotosEnabled}
            >
              <View className="flex-row gap-2.5">
                <TouchableOpacity
                  onPress={() => pickImages('gallery')}
                  className="flex-1 flex-row items-center justify-center bg-gray-50 border-[1.5px] border-violet-200 rounded-xl py-3 gap-1.5"
                  activeOpacity={0.8}
                >
                  <Ionicons name="images-outline" size={15} color="#7C3AED" />
                  <Text className="text-[13px] font-semibold text-violet-700">Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => pickImages('camera')}
                  className="flex-1 flex-row items-center justify-center bg-gray-50 border-[1.5px] border-orange-300 rounded-xl py-3 gap-1.5"
                  activeOpacity={0.8}
                >
                  <Ionicons name="camera-outline" size={15} color={ORANGE} />
                  <Text className="text-[13px] font-semibold text-tertiary-500">Camera</Text>
                </TouchableOpacity>
              </View>
              {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                  <View className="flex-row gap-2.5">
                    {images.map((img, idx) => (
                      <View key={idx} className="relative">
                        <Image
                          source={{ uri: img.uri }}
                          className="w-[72px] h-[72px] rounded-xl bg-gray-100"
                        />
                        <TouchableOpacity
                          onPress={() => removeImage(img.uri)}
                          className="absolute -top-1.5 -right-1.5 bg-black/50 rounded-xl"
                          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                        >
                          <Ionicons name="close-circle" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </OptionRow>
          </View>
        </ScrollView>

        {/* ── Sticky Footer ──────────────────────────────────────────────── */}
        <View
          className="flex-row items-center bg-white px-4 pt-3.5 border-t border-gray-100 shadow-md"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-1 mr-3">
            <Text className="text-sm font-extrabold text-gray-900">
              {selected.size === 0
                ? 'No service selected'
                : `${selected.size} service${selected.size !== 1 ? 's' : ''} selected`}
            </Text>
            {selectedList.length > 0 && (
              <Text className="text-[11px] text-gray-400 mt-0.5" numberOfLines={1}>
                {selectedList.map((s) => s.service_name).join(' · ')}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
            className={`flex-row items-center px-5 py-3.5 rounded-2xl ${
              canSubmit ? 'bg-tertiary-500' : 'bg-gray-300'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={15} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-white text-sm font-extrabold">Send Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Date Picker – iOS (spinner in modal) ─────────────────────────── */}
      {datePickerFor !== null && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-end">
            <View className="w-full bg-white rounded-t-3xl pt-5 pb-8 px-5">
              <Text className="text-base font-extrabold text-gray-900 text-center mb-2">
                {datePickerFor === 'preferred' ? '📅 Preferred Date & Time' : '⏰ Completion Deadline'}
              </Text>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={(_, date) => { if (date) setTempDate(date); }}
                style={{ width: '100%' }}
              />
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => setDatePickerFor(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 items-center"
                >
                  <Text className="text-sm font-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (datePickerFor === 'preferred') setPreferredDate(tempDate);
                    else setDeadlineDate(tempDate);
                    setDatePickerFor(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-tertiary-500 items-center"
                >
                  <Text className="text-sm font-bold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Date Picker – Android (native two-step: date then time) ─────── */}
      {datePickerFor !== null && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode={androidPickerStep}
          display="default"
          onChange={(event, date) => {
            if (event.type === 'dismissed') {
              setDatePickerFor(null);
              setAndroidPickerStep('date');
              return;
            }
            if (!date) return;
            if (androidPickerStep === 'date') {
              // Preserve existing time, update only date portion
              const combined = new Date(tempDate);
              combined.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setTempDate(combined);
              setAndroidPickerStep('time');
            } else {
              // Preserve date portion, update time
              const combined = new Date(tempDate);
              combined.setHours(date.getHours(), date.getMinutes(), 0, 0);
              if (datePickerFor === 'preferred') setPreferredDate(combined);
              else setDeadlineDate(combined);
              setTempDate(combined);
              setDatePickerFor(null);
              setAndroidPickerStep('date');
            }
          }}
        />
      )}

      {/* ── Map Picker Modal ──────────────────────────────────────────────── */}
      {showMapPicker && (
        <MapPickerModal
          initialLat={latitude || 0.3155}
          initialLng={longitude || 32.5822}
          onConfirm={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
            setLocationSet(true);
            setShowMapPicker(false);
          }}
          onCancel={() => setShowMapPicker(false)}
        />
      )}

      {/* Service Detail Modal */}
      {detailService && (
        <ServiceDetailModal
          service={detailService}
          selectedItems={selectedItems[detailService.provider_service_id] ?? []}
          onToggleItem={(item) => toggleItem(detailService.provider_service_id, item)}
          onClose={() => setDetailService(null)}
          onOpenImage={(images, index) => setImageViewer({ images, index })}
        />
      )}

      {/* Full-screen Image Viewer */}
      {imageViewer && (
        <ImageViewerModal
          images={imageViewer.images}
          initialIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}
    </SafeAreaView>
  );
}
