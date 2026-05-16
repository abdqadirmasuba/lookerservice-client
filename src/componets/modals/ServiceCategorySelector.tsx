import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SelectorItem {
  id: string;
  name: string;
  description?: string;
}

interface ServiceCategorySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SelectorItem | null) => void;
  items: SelectorItem[];
  selectedId: string | null;
  title: string;
  placeholder?: string;
  isLoading?: boolean;
}

export function ServiceCategorySelector({
  visible,
  onClose,
  onSelect,
  items,
  selectedId,
  title,
  placeholder = 'Search...',
  isLoading = false,
}: ServiceCategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: SelectorItem) => {
    onSelect(item);
    onClose();
  };

  const handleClear = () => {
    onSelect(null);
    onClose();
  };

  const renderItem = ({ item }: { item: SelectorItem }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}
        className={`p-4 border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-base font-medium ${
                isSelected ? 'text-blue-700' : 'text-gray-900'
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.description && (
              <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
          {isSelected && (
            <View className="ml-3">
              <Ionicons name="checkmark-circle" size={20} color="#2DA9E9" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Dark backdrop — tap to dismiss */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        {/* Sheet — stop press propagation so taps inside don't close */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '72%',
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            paddingBottom: insets.bottom,
          }}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View className="px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-gray-900 text-base ml-2"
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2DA9E9" />
              <Text className="text-gray-500 mt-3 text-sm">Loading...</Text>
            </View>
          ) : filteredItems.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Text className="text-5xl mb-4">🔍</Text>
              <Text className="text-gray-700 font-semibold text-lg text-center">
                No results found
              </Text>
              <Text className="text-gray-500 text-center mt-2 text-sm">
                {searchQuery
                  ? `No matches for "${searchQuery}"`
                  : `No ${title.toLowerCase()} available`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          )}

          {/* Footer: Clear button */}
          {selectedId && !isLoading && (
            <View className="px-4 pb-4 pt-2 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleClear}
                className="bg-gray-100 py-4 rounded-xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 font-semibold text-base">Clear Selection</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
