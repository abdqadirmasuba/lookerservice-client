import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProviderInfo } from './requestTypes';
import { availabilityMeta, BLUE } from './requestTypes';

interface ProviderSnapshotProps {
  info: ProviderInfo;
}

export default function ProviderSnapshot({ info }: ProviderSnapshotProps) {
  const avail = availabilityMeta(info.availability_status);

  return (
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
  );
}
