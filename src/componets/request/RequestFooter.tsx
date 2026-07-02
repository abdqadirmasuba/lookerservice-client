import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProviderInfoService } from './requestTypes';

interface RequestFooterProps {
  selected: Set<string>;
  selectedList: ProviderInfoService[];
  isSubmitting: boolean;
  paddingBottom: number;
  onSubmit: () => void;
}

export default function RequestFooter({
  selected, selectedList, isSubmitting, paddingBottom, onSubmit,
}: RequestFooterProps) {
  const canSubmit = selected.size > 0 && !isSubmitting;

  return (
    <View
      className="flex-row items-center bg-white px-4 pt-3.5 border-t border-gray-100 shadow-md"
      style={{ paddingBottom }}
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
        onPress={onSubmit}
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
  );
}
