import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, MapPressEvent, Region } from 'react-native-maps';
import { ORANGE } from './requestTypes';

interface MapPickerModalProps {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onCancel: () => void;
}

export default function MapPickerModal({ initialLat, initialLng, onConfirm, onCancel }: MapPickerModalProps) {
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
        {/* Header */}
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

        {/* Hint */}
        <View className="flex-row items-center bg-yellow-50 px-4 py-2 gap-1.5">
          <Ionicons name="information-circle-outline" size={15} color="#6B7280" />
          <Text className="text-xs text-gray-500">Tap the map to place your pin</Text>
        </View>

        {/* Map */}
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

        {/* Footer */}
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
