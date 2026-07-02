import React, { useEffect, useMemo, useState } from 'react';
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
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLUE = '#2DA9E9';
const ORANGE = '#F57C1F';

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

function toScriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function generateMapHtml(markers: Array<ProviderMapPin & { id: string }>) {
  const markerJson = toScriptJson(markers);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            width: 100%;
          }
          body {
            background: #f9fafb;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .leaflet-container {
            background: #eef2f7;
          }
          .custom-popup h3 {
            color: ${BLUE};
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 6px;
          }
          .custom-popup p {
            color: #64748b;
            font-size: 13px;
            line-height: 18px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          window.onerror = function(message) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'map-error',
                message: String(message || 'Map failed to load')
              }));
            }
          };

          function postReady() {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-ready' }));
            }
          }

          function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function(character) {
              return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
              }[character];
            });
          }

          function popupHtml(pin) {
            var title = escapeHtml(pin.title);
            var address = escapeHtml(pin.address);
            return '<div class="custom-popup"><h3>' + title + '</h3>' +
              (address ? '<p>' + address + '</p>' : '') +
              '</div>';
          }

          try {
            var markers = ${markerJson};
            var map = L.map('map', {
              attributionControl: true,
              zoomControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              detectRetina: true,
              maxZoom: 19
            }).addTo(map);

            var customIcon = L.divIcon({
              className: 'provider-marker',
              html: '<div style="background:${ORANGE};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3)"><div style="width:10px;height:10px;background:white;border-radius:50%;margin:8px auto;transform:rotate(45deg)"></div></div>',
              iconAnchor: [16, 32],
              iconSize: [32, 32],
              popupAnchor: [0, -32]
            });

            var bounds = L.latLngBounds([]);

            markers.forEach(function(pin) {
              var latLng = L.latLng(pin.latitude, pin.longitude);
              var marker = L.marker(latLng, { icon: customIcon }).addTo(map);
              marker.bindPopup(popupHtml(pin));
              bounds.extend(latLng);
            });

            if (markers.length === 1) {
              map.setView([markers[0].latitude, markers[0].longitude], 15);
              setTimeout(function() {
                map.eachLayer(function(layer) {
                  if (layer.openPopup) {
                    layer.openPopup();
                  }
                });
              }, 300);
            } else {
              map.fitBounds(bounds, {
                maxZoom: 15,
                padding: [40, 40]
              });
            }

            setTimeout(function() {
              map.invalidateSize();
              postReady();
            }, 250);
          } catch (error) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'map-error',
                message: error && error.message ? error.message : 'Map failed to load'
              }));
            }
          }
        </script>
      </body>
    </html>
  `;
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
  const [hasError, setHasError] = useState(false);

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

  const mapHtml = useMemo(() => generateMapHtml(markers), [markers]);

  useEffect(() => {
    if (visible) {
      setIsMapReady(false);
      setHasError(false);
    }
  }, [mapHtml, visible]);

  if (!visible) return null;

  const hasValidLocation = markers.length > 0;
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
          {!hasValidLocation ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={44} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Location Not Available</Text>
              <Text style={styles.emptyText}>
                Coordinates for this provider are not available.
              </Text>
            </View>
          ) : (
            <>
              {!isMapReady && !hasError ? (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={BLUE} />
                  <Text style={styles.loadingText}>Loading map...</Text>
                </View>
              ) : null}

              {hasError ? (
                <View style={styles.emptyState}>
                  <Ionicons name="map-outline" size={44} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>Map Failed To Load</Text>
                  <Text style={styles.emptyText}>
                    Please check your internet connection and try again.
                  </Text>
                </View>
              ) : null}

              {!hasError ? (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: mapHtml, baseUrl: 'https://localhost' }}
                  style={[styles.map, isMapReady ? null : styles.hiddenMap]}
                  javaScriptEnabled
                  domStorageEnabled
                  bounces={false}
                  mixedContentMode="always"
                  onMessage={(event) => {
                    try {
                      const payload = JSON.parse(event.nativeEvent.data);
                      if (payload.type === 'map-ready') {
                        setIsMapReady(true);
                      }
                      if (payload.type === 'map-error') {
                        setHasError(true);
                        setIsMapReady(false);
                      }
                    } catch {
                      setHasError(true);
                      setIsMapReady(false);
                    }
                  }}
                  onError={() => {
                    setHasError(true);
                    setIsMapReady(false);
                  }}
                  onHttpError={() => {
                    setHasError(true);
                    setIsMapReady(false);
                  }}
                />
              ) : null}
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
  hiddenMap: {
    opacity: 0,
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
