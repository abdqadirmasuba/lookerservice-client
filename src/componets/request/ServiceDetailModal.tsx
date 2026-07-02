import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProviderInfoService, ServiceListItem } from './requestTypes';
import { ORANGE } from './requestTypes';

interface ServiceDetailModalProps {
  service: ProviderInfoService;
  selectedItems: ServiceListItem[];
  onToggleItem: (item: ServiceListItem) => void;
  onClose: () => void;
  onOpenImage: (images: string[], index: number) => void;
}

export default function ServiceDetailModal({
  service,
  selectedItems,
  onToggleItem,
  onClose,
  onOpenImage,
}: ServiceDetailModalProps) {
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

          {/* Items list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
            {service.service_list.map((item, idx) => {
              const isItemSelected = selectedItems.some((s) => s.label === item.label);
              return (
                <View key={idx}>
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
