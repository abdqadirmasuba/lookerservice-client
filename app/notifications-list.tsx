import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import { markAsRead, markAllAsRead } from '../src/store/slices/notificationsSlice';
import { useState } from 'react';
import { NotificationType } from '../src/types';

export default function NotificationsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch notifications from API
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_BID:
        return 'pricetag';
      case NotificationType.BID_ACCEPTED:
        return 'checkmark-circle';
      case NotificationType.BOOKING_CONFIRMED:
      case NotificationType.BOOKING_CANCELLED:
        return 'calendar';
      case NotificationType.NEW_MESSAGE:
        return 'chatbubble';
      case NotificationType.PAYMENT_RECEIVED:
        return 'card';
      default:
        return 'notifications';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text className="text-primary-500 font-medium">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">No notifications yet</Text>
            <Text className="text-gray-600 text-center px-8">
              We'll notify you when something important happens
            </Text>
          </View>
        ) : (
          <View className="px-6 py-4">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => {
                  handleMarkAsRead(notification.id);
                  // Navigate to relevant screen based on notification type
                }}
                className={`${
                  notification.isRead ? 'bg-white' : 'bg-blue-50'
                } rounded-xl p-4 mb-3 shadow-sm`}
              >
                <View className="flex-row">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      notification.isRead ? 'bg-gray-100' : 'bg-blue-100'
                    }`}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={notification.isRead ? '#6B7280' : '#2563EB'}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text
                        className={`font-semibold text-base flex-1 ${
                          notification.isRead ? 'text-gray-700' : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.isRead && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-2" />
                      )}
                    </View>
                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {formatTime(notification.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Settings Link */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          onPress={() => router.push('/(account)/notifications')}
          className="flex-row items-center justify-center"
        >
          <Ionicons name="settings-outline" size={20} color="#2563EB" />
          <Text className="text-primary-500 font-medium ml-2">Notification Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
