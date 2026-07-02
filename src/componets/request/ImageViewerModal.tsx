import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ImageViewerModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageViewerModal({ images, initialIndex, onClose }: ImageViewerModalProps) {
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
