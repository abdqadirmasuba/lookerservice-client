import React from 'react';
import { View, Text, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ORANGE } from './requestTypes';

interface OptionRowProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  summary?: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}

export default function OptionRow({
  icon, iconBg, iconColor, label, summary, enabled, onToggle, children,
}: OptionRowProps) {
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
