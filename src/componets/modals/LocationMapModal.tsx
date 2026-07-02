import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#2DA9E9';
const ORANGE = '#F57C1F';
const DEFAULT_LATITUDE_DELTA = 0.04;
const DEFAULT_LONGITUDE_DELTA = 0.04;

interface ProviderMapPin {
  id?: string;
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  pins?: ProviderMapPin[];
}

function toValidCoordinate(latitude: number, longitude: number) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return { latitude: lat, longitude: lng };
}

function getRegion(markers: ProviderMapPin[]): Region {
  if (markers.length === 1) {
    return {
      latitude: markers[0].latitude,
      longitude: markers[0].longitude,
      latitudeDelta: DEFAULT_LATITUDE_DELTA,
      longitudeDelta: DEFAULT_LONGITUDE_DELTA,
    };
  }

  const latitudes = markers.map((marker) => marker.latitude);
  const longitudes = markers.map((marker) => marker.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeDelta = Math.max((maxLatitude - minLatitude) * 1.6, DEFAULT_LATITUDE_DELTA);
  const longitudeDelta = Math.max((maxLongitude - minLongitude) * 1.6, DEFAULT_LONGITUDE_DELTA);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    longitude: (minLongitude + maxLongitude) / 2,
    latitudeDelta,
    longitudeDelta,
  };
}

export default function LocationMapModal({
  visible,
  onClose,
  latitude,
  longitude,
  title,
  address,
  pins,
}: LocationMapModalProps) {
  const [isMapReady, setIsMapReady] = useState(false);

  const markers = useMemo(() => {
    const sourcePins =
      pins && pins.length > 0
        ? pins
        : [{ latitude, longitude, title, address }];

    return sourcePins
      .map((pin, index) => {
        const coordinate = toValidCoordinate(pin.latitude, pin.longitude);
        if (!coordinate) return null;

        return {
          ...pin,
          id: pin.id ?? `${coordinate.latitude}-${coordinate.longitude}-${index}`,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        };
      })
      .filter((pin): pin is ProviderMapPin & { id: string } => pin !== null);
  }, [address, latitude, longitude, pins, title]);

  if (!visible) return null;

  const hasValidLocation = markers.length > 0;
  const region = hasValidLocation ? getRegion(markers) : null;
  const coordinateLabel =
    markers.length === 1
      ? `${markers[0].latitude.toFixed(6)}, ${markers[0].longitude.toFixed(6)}`
      : `${markers.length} provider locations`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {address ? (
              <Text style={styles.address} numberOfLines={1}>
                {address}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Close map"
          >
            <Ionicons name="close" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          {!hasValidLocation || !region ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={44} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Location Not Available</Text>
              <Text style={styles.emptyText}>
                Coordinates for this provider are not available.
              </Text>
            </View>
          ) : (
            <>
              {!isMapReady ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={BLUE} />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              ) : null}
              <MapView
                key={markers.map((marker) => marker.id).join('|')}
                style={styles.map}
                initialRegion={region}
                onMapReady={() => setIsMapReady(true)}
              >
                {markers.map((marker) => (
                  <Marker
                    key={marker.id}
                    coordinate={{
                      latitude: marker.latitude,
                      longitude: marker.longitude,
                    }}
                    title={marker.title}
                    description={marker.address}
                    pinColor={ORANGE}
                  />
                ))}
              </MapView>
            </>
          )}
        </View>

        {hasValidLocation ? (
          <View style={styles.footer}>
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>{coordinateLabel}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  address: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: 12,
    width: 36,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginLeft: 6,
    textAlign: 'center',
  },
});
