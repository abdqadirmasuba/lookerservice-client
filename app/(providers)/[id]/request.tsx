import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { apiRequests } from '@/src/utils/apiRequests';
import { useAppSelector } from '@/src/store/hooks';
import AuthRequiredModal from '@/src/componets/modals/AuthRequiredModal';

// â”€â”€â”€ Sub-components 
import ProviderSnapshot from '@/src/componets/request/ProviderSnapshot';
import ServiceSelector from '@/src/componets/request/ServiceSelector';
import OptionalDetails from '@/src/componets/request/OptionalDetails';
import RequestFooter from '@/src/componets/request/RequestFooter';
import MapPickerModal from '@/src/componets/request/MapPickerModal';
import ServiceDetailModal from '@/src/componets/request/ServiceDetailModal';
import ImageViewerModal from '@/src/componets/request/ImageViewerModal';

import {
  type ProviderInfo,
  type ProviderInfoService,
  type ServiceListItem,
  type PickedImage,
  formatRequestDate,
  BLUE,
} from '@/src/componets/request/requestTypes';

const HEADER_BACK = (onBack: () => void, title: string) => (
  <View className="flex-row items-center justify-between bg-white px-5 py-3.5 border-b border-gray-100">
    <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="arrow-back" size={24} color="#1F2937" />
    </TouchableOpacity>
    <Text className="text-[17px] font-bold text-gray-900">{title}</Text>
    <View className="w-6" />
  </View>
);

export default function ProviderRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, service_id } = useLocalSearchParams<{ id: string; service_id?: string }>();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // â”€â”€ Provider info 
  const [info, setInfo] = useState<ProviderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // â”€â”€ Service selection 
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Record<string, ServiceListItem[]>>({});
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [detailService, setDetailService] = useState<ProviderInfoService | null>(null);
  const [imageViewer, setImageViewer] = useState<{ images: string[]; index: number } | null>(null);
  const [showAll, setShowAll] = useState(false);

  // â”€â”€ Optional fields 
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

  // â”€â”€ Shared date picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [datePickerFor, setDatePickerFor] = useState<'preferred' | 'deadline' | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [androidPickerStep, setAndroidPickerStep] = useState<'date' | 'time'>('date');

  // â”€â”€ Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const fetchInfo = useCallback(async () => {
    if (!isAuthenticated) { setIsLoading(false); return; }
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
      }
    } catch (_) {}
    finally { setIsLoading(false); }
  }, [id, service_id, isAuthenticated]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleService = (psid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(psid)) {
        next.delete(psid);
        setSelectedItems((si) => { const n = { ...si }; delete n[psid]; return n; });
      } else { next.add(psid); }
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
    setTempDate(field === 'preferred' ? (preferredDate ?? new Date()) : (deadlineDate ?? new Date()));
    setDatePickerFor(field);
  };

  const pickImages = async (source: 'gallery' | 'camera') => {
    const result = source === 'gallery'
      ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsMultipleSelection: true, quality: 0.8 })
      : await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const next: PickedImage[] = result.assets.map((a) => ({
        uri: a.uri, name: a.fileName ?? a.uri.split('/').pop() ?? 'photo.jpg', type: a.mimeType ?? 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...next]);
    }
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((i) => i.uri !== uri));

  // â”€â”€ Submit â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];
      if (photosEnabled && images.length > 0) {
        try {
          imageUrls = await Promise.all(images.map(async (img) => {
            const presignRes = await apiRequests.post('/client/uploads/presign', {
              file_name: img.name, content_type: img.type, upload_type: 'request_image',
            });
            if (!presignRes.data.success) throw new Error(presignRes.data.message || 'Failed to get upload URL');
            const { upload_url, public_url } = presignRes.data.data as { upload_url: string; public_url: string };
            const blob = await (await fetch(img.uri)).blob();
            await apiRequests.uploadToS3(upload_url, blob, img.type);
            return public_url;
          }));
        } catch (upErr: any) {
          Alert.alert('Upload Failed', upErr.message || 'Could not upload images.');
          setIsSubmitting(false);
          return;
        }
      }
      const payload: Record<string, any> = {
        target_provider_id: id,
        provider_services: Array.from(selected).map((psid) => ({
          id: psid,
          items: (selectedItems[psid] ?? []).map(({ label, amount, currency }) => ({
            label, ...(amount !== undefined && { amount }), ...(currency !== undefined && { currency }),
          })),
        })),
        latitude: locationEnabled && locationSet ? latitude : 0,
        longitude: locationEnabled && locationSet ? longitude : 0,
      };
      if (descEnabled && description.trim()) payload.description = description.trim();
      if (prefDateEnabled && preferredDate) payload.preferred_date = preferredDate.toISOString();
      if (deadlineEnabled && deadlineDate) payload.deadline = deadlineDate.toISOString();
      if (budgetEnabled) {
        const mn = parseFloat(budgetMin); const mx = parseFloat(budgetMax);
        if (!isNaN(mn)) payload.budget_min = mn;
        if (!isNaN(mx)) payload.budget_max = mx;
      }
      if (imageUrls.length > 0) payload.images = imageUrls;

      const res = await apiRequests.post('/client/service-requests/direct', payload);
      if (res.data.success) {
        Alert.alert('Request Sent!', `Your request has been sent to ${info?.business_name}. They will review it shortly.`, [
          { text: 'View Requests', onPress: () => router.replace('/(tabs)/requests') },
          { text: 'Go Home', onPress: () => router.replace('/(tabs)/home'), style: 'cancel' },
        ]);
      } else { throw new Error(res.data.message || 'Failed to submit'); }
    } catch (err: any) {
      Alert.alert('Submission Failed', err.response?.data?.message || err.message || 'Could not submit your request.');
    } finally { setIsSubmitting(false); }
  };

  // â”€â”€ Auth guard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {HEADER_BACK(() => router.back(), 'Request Service')}
        <AuthRequiredModal
          visible
          onBack={() => router.back()}
          message="Sign in to request this service and send it directly to the provider."
        />
      </SafeAreaView>
    );
  }

  // â”€â”€ Loading / error states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {HEADER_BACK(() => router.back(), 'Request Service')}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={BLUE} />
          <Text className="text-gray-400 mt-2.5 text-[13px]">Loading provider info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!info) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
        {HEADER_BACK(() => router.back(), 'Request Service')}
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600 text-[15px]">Provider information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // â”€â”€ Derived values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const matchedPsid = service_id
    ? info.services.find((s) => s.service_id === service_id)?.provider_service_id ?? null
    : null;
  const selectedList = info.services.filter((s) => selected.has(s.provider_service_id));

  const descSummary = descEnabled && description ? `${description.length} chars` : 'Optional notes for the provider';
  const prefDateSummary = prefDateEnabled && preferredDate ? formatRequestDate(preferredDate) : 'Not set';
  const deadlineSummary = deadlineEnabled && deadlineDate ? formatRequestDate(deadlineDate) : 'Not set';
  const locationSummary = locationEnabled && locationSet ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Where do you need this done?';
  const budgetSummary = budgetEnabled && (budgetMin || budgetMax) ? `${budgetMin || '0'} â€“ ${budgetMax || 'âˆž'}` : 'Set a min / max budget';
  const photosSummary = photosEnabled && images.length > 0 ? `${images.length} photo${images.length !== 1 ? 's' : ''} added` : 'Add photos of the issue';

  // â”€â”€ Render 
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {HEADER_BACK(() => router.back(), 'Provider Request')}

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <ProviderSnapshot info={info} />

          <ServiceSelector
            info={info} selected={selected} selectedItems={selectedItems}
            expandedServices={expandedServices} matchedPsid={matchedPsid}
            showAll={showAll} service_id={service_id}
            onToggleService={toggleService} onToggleItem={toggleItem}
            onToggleExpanded={toggleExpanded} onOpenDetail={setDetailService}
            onSetShowAll={setShowAll}
          />

          <OptionalDetails
            descEnabled={descEnabled} setDescEnabled={setDescEnabled}
            description={description} setDescription={setDescription}
            prefDateEnabled={prefDateEnabled} setPrefDateEnabled={setPrefDateEnabled}
            preferredDate={preferredDate} onPickPreferredDate={() => openDatePicker('preferred')}
            deadlineEnabled={deadlineEnabled} setDeadlineEnabled={setDeadlineEnabled}
            deadlineDate={deadlineDate} onPickDeadlineDate={() => openDatePicker('deadline')}
            locationEnabled={locationEnabled} onToggleLocation={handleLocationToggle}
            locationSet={locationSet} latitude={latitude} longitude={longitude}
            onOpenMap={() => setShowMapPicker(true)}
            budgetEnabled={budgetEnabled} setBudgetEnabled={setBudgetEnabled}
            budgetMin={budgetMin} setBudgetMin={setBudgetMin}
            budgetMax={budgetMax} setBudgetMax={setBudgetMax}
            photosEnabled={photosEnabled} setPhotosEnabled={setPhotosEnabled}
            images={images} onPickGallery={() => pickImages('gallery')}
            onPickCamera={() => pickImages('camera')} onRemoveImage={removeImage}
            descSummary={descSummary} prefDateSummary={prefDateSummary}
            deadlineSummary={deadlineSummary} locationSummary={locationSummary}
            budgetSummary={budgetSummary} photosSummary={photosSummary}
          />
        </ScrollView>

        <RequestFooter
          selected={selected} selectedList={selectedList}
          isSubmitting={isSubmitting} paddingBottom={insets.bottom + 12}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>

       {/* Date Picker  */}
      {datePickerFor !== null && Platform.OS === 'ios' && (
        <Modal visible transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-end">
            <View className="w-full bg-white rounded-t-3xl pt-5 pb-8 px-5">
              <Text className="text-base font-extrabold text-gray-900 text-center mb-2">
                {datePickerFor === 'preferred' ? 'ðŸ“… Preferred Date & Time' : 'â° Completion Deadline'}
              </Text>
              <DateTimePicker value={tempDate} mode="datetime" display="spinner" onChange={(_, d) => { if (d) setTempDate(d); }} style={{ width: '100%' }} />
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity onPress={() => setDatePickerFor(null)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 items-center">
                  <Text className="text-sm font-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { if (datePickerFor === 'preferred') setPreferredDate(tempDate); else setDeadlineDate(tempDate); setDatePickerFor(null); }}
                  className="flex-1 py-3.5 rounded-2xl bg-tertiary-500 items-center"
                >
                  <Text className="text-sm font-bold text-white">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker  */}
      {datePickerFor !== null && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate} mode={androidPickerStep} display="default"
          onChange={(event, date) => {
            if (event.type === 'dismissed') { setDatePickerFor(null); setAndroidPickerStep('date'); return; }
            if (!date) return;
            if (androidPickerStep === 'date') {
              const combined = new Date(tempDate);
              combined.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
              setTempDate(combined); setAndroidPickerStep('time');
            } else {
              const combined = new Date(tempDate);
              combined.setHours(date.getHours(), date.getMinutes(), 0, 0);
              if (datePickerFor === 'preferred') setPreferredDate(combined); else setDeadlineDate(combined);
              setTempDate(combined); setDatePickerFor(null); setAndroidPickerStep('date');
            }
          }}
        />
      )}

      {/* Map Picker */}
      {showMapPicker && (
        <MapPickerModal
          initialLat={latitude || 0.3155} initialLng={longitude || 32.5822}
          onConfirm={(lat, lng) => { setLatitude(lat); setLongitude(lng); setLocationSet(true); setShowMapPicker(false); }}
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
          onOpenImage={(imgs, index) => setImageViewer({ images: imgs, index })}
        />
      )}

      {/* â”€â”€ Image Viewer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {imageViewer && (
        <ImageViewerModal
          images={imageViewer.images} initialIndex={imageViewer.index}
          onClose={() => setImageViewer(null)}
        />
      )}
    </SafeAreaView>
  );
}
