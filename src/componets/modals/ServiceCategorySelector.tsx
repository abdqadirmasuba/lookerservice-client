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
import { SafeAreaView } from 'react-native-safe-area-context';

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
        className={`p-4 border-b border-gray-100 dark:border-[#334155] ${
          isSelected ? 'bg-primary-50 dark:bg-blue-900/20' : ''
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className={`text-base font-medium ${
                isSelected
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-gray-900 dark:text-white'
              }`}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.description && (
              <Text
                className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
          {isSelected && (
            <View className="ml-3">
              <Text className="text-primary-600 dark:text-primary-300 text-xl">✓</Text>
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white dark:bg-[#0F172A]" edges={['top', 'bottom']}>
        {/* Header */}
        <View className="border-b border-gray-100 dark:border-[#1E293B] px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text className="text-gray-400 text-2xl">×</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View className="flex-row items-center bg-gray-100 dark:bg-[#1E293B] rounded-xl px-4 py-3">
            <Text className="text-gray-400 mr-2">🔍</Text>
            <TextInput
              className="flex-1 text-gray-900 dark:text-white text-base"
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
                <Text className="text-gray-400 text-xl">×</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2DA9E9" />
            <Text className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Loading...</Text>
          </View>
        ) : filteredItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-5xl mb-4">🔍</Text>
            <Text className="text-gray-700 dark:text-gray-300 font-semibold text-lg text-center">
              No results found
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mt-2 text-sm">
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
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {/* Footer: Clear button */}
        {selectedId && !isLoading && (
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-[#1E293B]">
            <TouchableOpacity
              onPress={handleClear}
              className="bg-gray-100 dark:bg-[#1E293B] py-4 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                Clear Selection
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}
