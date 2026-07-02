import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OptionRow from './OptionRow';
import type { PickedImage } from './requestTypes';
import { BLUE, ORANGE } from './requestTypes';

export interface OptionalDetailsProps {
  // Description
  descEnabled: boolean;
  setDescEnabled: (v: boolean) => void;
  description: string;
  setDescription: (v: string) => void;
  // Preferred date
  prefDateEnabled: boolean;
  setPrefDateEnabled: (v: boolean) => void;
  preferredDate: Date | null;
  onPickPreferredDate: () => void;
  // Deadline
  deadlineEnabled: boolean;
  setDeadlineEnabled: (v: boolean) => void;
  deadlineDate: Date | null;
  onPickDeadlineDate: () => void;
  // Location
  locationEnabled: boolean;
  onToggleLocation: (v: boolean) => void;
  locationSet: boolean;
  latitude: number;
  longitude: number;
  onOpenMap: () => void;
  // Budget
  budgetEnabled: boolean;
  setBudgetEnabled: (v: boolean) => void;
  budgetMin: string;
  setBudgetMin: (v: string) => void;
  budgetMax: string;
  setBudgetMax: (v: string) => void;
  // Photos
  photosEnabled: boolean;
  setPhotosEnabled: (v: boolean) => void;
  images: PickedImage[];
  onPickGallery: () => void;
  onPickCamera: () => void;
  onRemoveImage: (uri: string) => void;
  // Computed summaries
  descSummary: string;
  prefDateSummary: string;
  deadlineSummary: string;
  locationSummary: string;
  budgetSummary: string;
  photosSummary: string;
}

export default function OptionalDetails({
  descEnabled, setDescEnabled, description, setDescription,
  prefDateEnabled, setPrefDateEnabled, preferredDate, onPickPreferredDate,
  deadlineEnabled, setDeadlineEnabled, deadlineDate, onPickDeadlineDate,
  locationEnabled, onToggleLocation, locationSet, latitude, longitude, onOpenMap,
  budgetEnabled, setBudgetEnabled, budgetMin, setBudgetMin, budgetMax, setBudgetMax,
  photosEnabled, setPhotosEnabled, images, onPickGallery, onPickCamera, onRemoveImage,
  descSummary, prefDateSummary, deadlineSummary, locationSummary, budgetSummary, photosSummary,
}: OptionalDetailsProps) {
  return (
    <>
      {/* Section divider */}
      <View className="flex-row items-center mx-4 mt-7 mb-1">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="text-[11px] font-bold text-gray-500 uppercase tracking-wide px-2.5">
          Optional Details
        </Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>
      <Text className="text-[11px] text-gray-400 text-center mb-3">
        All fields below are optional — toggle to add
      </Text>

      <View className="mx-4 rounded-[18px] overflow-hidden border border-gray-100">
        {/* Description */}
        <OptionRow
          icon="document-text-outline" iconBg="#F3F4F6" iconColor="#6B7280"
          label="Description" summary={descSummary}
          enabled={descEnabled} onToggle={setDescEnabled}
        >
          <TextInput
            className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 min-h-[90px]"
            placeholder="Describe your request in detail..."
            placeholderTextColor="#9CA3AF"
            multiline numberOfLines={4} textAlignVertical="top"
            value={description} onChangeText={setDescription}
          />
        </OptionRow>

        {/* Preferred Date */}
        <OptionRow
          icon="calendar-outline" iconBg="#EFF6FF" iconColor={BLUE}
          label="Preferred Date" summary={prefDateSummary}
          enabled={prefDateEnabled} onToggle={setPrefDateEnabled}
        >
          <TouchableOpacity
            onPress={onPickPreferredDate}
            className="flex-row items-center bg-gray-50 border-[1.5px] border-blue-200 rounded-xl px-3 py-3 gap-2"
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={15} color={BLUE} />
            <Text className={`flex-1 text-[13px] font-medium ${preferredDate ? 'text-gray-700' : 'text-gray-400'}`}>
              {preferredDate ? prefDateSummary : 'Tap to set preferred date & time'}
            </Text>
            <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
          </TouchableOpacity>
        </OptionRow>

        {/* Deadline */}
        <OptionRow
          icon="hourglass-outline" iconBg="#FEF2F2" iconColor="#DC2626"
          label="Deadline" summary={deadlineSummary}
          enabled={deadlineEnabled} onToggle={setDeadlineEnabled}
        >
          <TouchableOpacity
            onPress={onPickDeadlineDate}
            className="flex-row items-center bg-gray-50 border-[1.5px] border-red-300 rounded-xl px-3 py-3 gap-2"
            activeOpacity={0.8}
          >
            <Ionicons name="hourglass-outline" size={15} color="#DC2626" />
            <Text className={`flex-1 text-[13px] font-medium ${deadlineDate ? 'text-gray-700' : 'text-gray-400'}`}>
              {deadlineDate ? deadlineSummary : 'Tap to set a completion deadline'}
            </Text>
            <Ionicons name="chevron-forward" size={15} color="#9CA3AF" />
          </TouchableOpacity>
        </OptionRow>

        {/* Service Location */}
        <OptionRow
          icon="location-outline" iconBg="#FFF7ED" iconColor={ORANGE}
          label="Service Location" summary={locationSummary}
          enabled={locationEnabled} onToggle={onToggleLocation}
        >
          <TouchableOpacity
            // onPress={onOpenMap}
            onPress={()=>{}}
            className="flex-row items-center bg-gray-50 border-[1.5px] border-orange-300 rounded-xl px-3 py-3 gap-2"
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={15} color={ORANGE} />
            <Text className={`flex-1 text-[13px] font-medium ${locationSet ? 'text-gray-700' : 'text-gray-400'}`}>
              {locationSet ? `${latitude.toFixed(5)},  ${longitude.toFixed(5)}` : 'Tap to set location on map'}
            </Text>
            {/* <Text className="text-xs text-tertiary-500 font-bold">
              {locationSet ? 'Change' : 'Open Map'}
            </Text> */}
          </TouchableOpacity>
        </OptionRow>

        {/* Budget Range */}
        <OptionRow
          icon="cash-outline" iconBg="#F0FDF4" iconColor="#16A34A"
          label="Budget Range" summary={budgetSummary}
          enabled={budgetEnabled} onToggle={setBudgetEnabled}
        >
          <View className="flex-row gap-2.5">
            <View className="flex-1">
              <Text className="text-[11px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Minimum</Text>
              <TextInput
                className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
                placeholder="e.g. 50000" placeholderTextColor="#9CA3AF"
                keyboardType="numeric" value={budgetMin}
                onChangeText={(v) => setBudgetMin(v.replace(/[^0-9.]/g, ''))}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">Maximum</Text>
              <TextInput
                className="bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900"
                placeholder="e.g. 150000" placeholderTextColor="#9CA3AF"
                keyboardType="numeric" value={budgetMax}
                onChangeText={(v) => setBudgetMax(v.replace(/[^0-9.]/g, ''))}
              />
            </View>
          </View>
        </OptionRow>

        {/* Photos */}
        <OptionRow
          icon="images-outline" iconBg="#F5F3FF" iconColor="#7C3AED"
          label="Photos" summary={photosSummary}
          enabled={photosEnabled} onToggle={setPhotosEnabled}
        >
          <View className="flex-row gap-2.5">
            <TouchableOpacity
              onPress={onPickGallery}
              className="flex-1 flex-row items-center justify-center bg-gray-50 border-[1.5px] border-violet-200 rounded-xl py-3 gap-1.5"
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={15} color="#7C3AED" />
              <Text className="text-[13px] font-semibold text-violet-700">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onPickCamera}
              className="flex-1 flex-row items-center justify-center bg-gray-50 border-[1.5px] border-orange-300 rounded-xl py-3 gap-1.5"
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={15} color={ORANGE} />
              <Text className="text-[13px] font-semibold text-tertiary-500">Camera</Text>
            </TouchableOpacity>
          </View>
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
              <View className="flex-row gap-2.5">
                {images.map((img, idx) => (
                  <View key={idx} className="relative">
                    <Image source={{ uri: img.uri }} className="w-[72px] h-[72px] rounded-xl bg-gray-100" />
                    <TouchableOpacity
                      onPress={() => onRemoveImage(img.uri)}
                      className="absolute -top-1.5 -right-1.5 bg-black/50 rounded-xl"
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </OptionRow>
      </View>
    </>
  );
}
