import React from 'react';
import { Modal, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

export default function LocationMapModal({
  visible,
  onClose,
  latitude,
  longitude,
  title,
  address
}: LocationMapModalProps) {
  
  // Generate HTML for Leaflet map with OpenStreetMap
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { 
            margin: 0; 
            padding: 0; 
          }
          #map { 
            width: 100vw; 
            height: 100vh; 
          }
          .custom-popup {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .custom-popup h3 {
            margin: 0 0 8px 0;
            color: #2DA9E9;
            font-size: 16px;
            font-weight: 600;
          }
          .custom-popup p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize map
          var map = L.map('map', {
            zoomControl: true,
            attributionControl: true
          }).setView([${latitude}, ${longitude}], 15);

          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          // Custom marker icon
          var customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #2DA9E9; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; margin: 8px auto; transform: rotate(45deg);"></div></div>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });

          // Add marker
          var marker = L.marker([${latitude}, ${longitude}], { icon: customIcon }).addTo(map);
          
          // Add popup
          var popupContent = '<div class="custom-popup"><h3>${title.replace(/'/g, "\\'")}</h3>${address ? `<p>${address.replace(/'/g, "\\'")}</p>` : ''}</div>';
          marker.bindPopup(popupContent).openPopup();

          // Disable scroll zoom by default (user can enable with controls)
          map.scrollWheelZoom.disable();
        </script>
      </body>
      </html>
    `;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top']}>
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-200 dark:border-[#334155] flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
              {title}
            </Text>
            {address && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
                {address}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="ml-3 w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-[#1E293B]"
            activeOpacity={0.7}
          >
            <Text className="text-gray-600 dark:text-gray-300 text-xl font-bold">×</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View className="flex-1">
          <WebView
            source={{ html: generateMapHTML() }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            bounces={false}
          />
        </View>

        {/* Footer with coordinates info */}
        <View className="px-4 py-3 border-t border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B]">
          <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
