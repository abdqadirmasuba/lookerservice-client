import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SvgIcon from '@/src/componets/common/SvgIcon';
import type { ProviderInfo, ProviderInfoService, ServiceListItem } from './requestTypes';
import { BLUE, ORANGE, VISIBLE_COUNT } from './requestTypes';

interface ServiceSelectorProps {
  info: ProviderInfo;
  selected: Set<string>;
  selectedItems: Record<string, ServiceListItem[]>;
  expandedServices: Set<string>;
  matchedPsid: string | null;
  showAll: boolean;
  service_id?: string;
  onToggleService: (psid: string) => void;
  onToggleItem: (psid: string, item: ServiceListItem) => void;
  onToggleExpanded: (psid: string) => void;
  onOpenDetail: (svc: ProviderInfoService) => void;
  onSetShowAll: (v: boolean) => void;
}

export default function ServiceSelector({
  info, selected, selectedItems, expandedServices, matchedPsid, showAll,
  service_id, onToggleService, onToggleItem, onToggleExpanded, onOpenDetail, onSetShowAll,
}: ServiceSelectorProps) {
  const displayedServices = showAll ? info.services : info.services.slice(0, VISIBLE_COUNT);
  const primarySelected = matchedPsid && selected.has(matchedPsid)
    ? info.services.find((s) => s.provider_service_id === matchedPsid)
    : info.services.find((s) => selected.has(s.provider_service_id)) ?? null;

  return (
    <>
      {/* Selected service pill */}
      {primarySelected && (
        <View className="mx-4 mt-5">
          <Text className="text-[15px] font-extrabold text-gray-900 mb-1">Selected Service</Text>
          <View className="flex-row items-center bg-blue-50 border-[1.5px] border-blue-200 rounded-2xl px-3.5 py-2.5">
            <View className="w-[30px] h-[30px] rounded-[8px] bg-white items-center justify-center mr-2.5">
              <SvgIcon uri={primarySelected.service_icon_url} size={20} fallback="⚙️" />
            </View>
            <Text className="flex-1 text-sm font-bold text-blue-700" numberOfLines={1}>
              {primarySelected.service_name}
            </Text>
            {selected.size > 1 && (
              <View className="bg-tertiary-500 px-2 py-0.5 rounded-xl">
                <Text className="text-white text-[11px] font-bold">+{selected.size - 1}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Service list */}
      <View className="mx-4 mt-5">
        <Text className="text-[15px] font-extrabold text-gray-900 mb-1">
          {service_id ? 'Add More Services' : 'Select Services'}
        </Text>
        <Text className="text-xs text-gray-400 mb-3">
          {service_id
            ? 'Optionally add other services from this provider'
            : 'Choose one or more services to request'}
        </Text>

        <View className="rounded-2xl overflow-hidden border border-gray-100">
          {displayedServices.map((svc) => {
            const checked = selected.has(svc.provider_service_id);
            const isExpanded = expandedServices.has(svc.provider_service_id);
            const isPrimary = svc.provider_service_id === matchedPsid;
            const svcItems = selectedItems[svc.provider_service_id] ?? [];

            return (
              <View key={svc.provider_service_id}>
                {/* Service header row */}
                <TouchableOpacity
                  onPress={() => onToggleService(svc.provider_service_id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center px-3.5 py-3 border-b ${
                    checked ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-50'
                  }`}
                >
                  <View
                    className={`w-[21px] h-[21px] rounded-[6px] border-2 items-center justify-center mr-3 shrink-0 ${
                      checked ? 'bg-tertiary-500 border-tertiary-500' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    {checked && <Ionicons name="checkmark" size={13} color="#fff" />}
                  </View>
                  <View className="w-9 h-9 rounded-[10px] bg-orange-50 items-center justify-center mr-3 shrink-0">
                    <SvgIcon uri={svc.service_icon_url} size={22} fallback="⚙️" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text
                        className={`text-[13px] font-semibold flex-1 ${checked ? 'text-gray-900' : 'text-gray-700'}`}
                        numberOfLines={1}
                      >
                        {svc.service_name}
                      </Text>
                      {isPrimary && (
                        <View className="bg-blue-50 px-1.5 py-0.5 rounded-[10px] ml-1.5">
                          <Text className="text-[10px] text-primary-500 font-bold">Selected</Text>
                        </View>
                      )}
                    </View>
                    {svcItems.length > 0 && (
                      <Text className="text-[11px] text-tertiary-500 font-medium mt-0.5">
                        {svcItems.length} item{svcItems.length !== 1 ? 's' : ''} selected
                      </Text>
                    )}
                  </View>
                  {/* Info button */}
                  <TouchableOpacity
                    onPress={() => onOpenDetail(svc)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    className="w-7 h-7 rounded-full bg-blue-50 items-center justify-center mx-2"
                  >
                    <Ionicons name="information-circle-outline" size={17} color={BLUE} />
                  </TouchableOpacity>
                  {/* Expand toggle */}
                  <TouchableOpacity
                    onPress={() => onToggleExpanded(svc.provider_service_id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Expanded items */}
                {isExpanded && svc.service_list.length > 0 && (
                  <View className="bg-gray-50 border-b border-gray-100">
                    {svc.service_list.map((item, itemIdx) => {
                      const isItemSelected = svcItems.some((s) => s.label === item.label);
                      return (
                        <TouchableOpacity
                          key={itemIdx}
                          onPress={() => onToggleItem(svc.provider_service_id, item)}
                          activeOpacity={0.75}
                          className={`flex-row items-center py-2.5 px-3.5 ml-10 border-b border-gray-100/80 ${
                            isItemSelected ? 'bg-orange-50' : ''
                          }`}
                        >
                          <View
                            className={`w-[18px] h-[18px] rounded-[5px] border-2 items-center justify-center mr-3 shrink-0 ${
                              isItemSelected ? 'bg-tertiary-500 border-tertiary-500' : 'bg-white border-gray-300'
                            }`}
                          >
                            {isItemSelected && <Ionicons name="checkmark" size={11} color="#fff" />}
                          </View>
                          <View className="flex-1">
                            <Text className={`text-[12px] font-medium ${isItemSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                              {item.label}
                            </Text>
                            {item.amount !== undefined && (
                              <Text className="text-[11px] text-tertiary-500 font-semibold mt-0.5">
                                {item.currency ?? 'UGX'} {item.amount.toLocaleString()}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {info.services.length > VISIBLE_COUNT && (
          <TouchableOpacity
            onPress={() => onSetShowAll(!showAll)}
            className="flex-row items-center justify-center py-3 bg-white border border-t-0 border-gray-100 rounded-b-2xl gap-1"
            activeOpacity={0.75}
          >
            <Text className="text-tertiary-500 text-[13px] font-semibold">
              {showAll ? 'Show fewer' : `See all ${info.services.length} services`}
            </Text>
            <Ionicons name={showAll ? 'chevron-up' : 'chevron-down'} size={15} color={ORANGE} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}
