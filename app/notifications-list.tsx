import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../src/store/hooks';
import { setNotifications, markAsRead, markAllAsRead, deleteNotification, setUnreadCount } from '../src/store/slices/notificationsSlice';
import { useState, useEffect, useCallback } from 'react';
import { apiRequests } from '@/src/utils/apiRequests';
import type { Notification } from '../src/types';

export default function NotificationsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapNotification = (n: any): Notification => ({
    id: n.id,
    userId: n.user_id,
    type: n.type,
    source: n.source,
    sourceId: n.source_id,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    data: n.data,
    createdAt: n.created_at,
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiRequests.get('/notifications');
      if (res.data.success) {
        dispatch(setNotifications((res.data.data ?? []).map(mapNotification)));
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequests.patch(`/notifications/${id}/read`, {});
      dispatch(markAsRead(id));
      dispatch(setUnreadCount(Math.max(0, notifications.filter(n => !n.isRead && n.id !== id).length)));
    } catch {
      dispatch(markAsRead(id));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequests.post('/notifications/mark-all-read', {});
      dispatch(markAllAsRead());
      dispatch(setUnreadCount(0));
    } catch {
      dispatch(markAllAsRead());
      dispatch(setUnreadCount(0));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequests.delete(`/notifications/${id}`);
    } catch {
      // silent
    } finally {
      dispatch(deleteNotification(id));
    }
  };

  const handleTap = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.source === 'booking' && notification.sourceId) {
      router.push({ pathname: '/(bookings)/[id]', params: { id: notification.sourceId } });
    } else if (notification.source === 'request' && notification.sourceId) {
      router.push({ pathname: '/(service-request)/[id]', params: { id: notification.sourceId } });
    }
  };

  const getNotificationIcon = (type: string, source?: string) => {
    switch (type) {
      case 'accept': return 'checkmark-circle';
      case 'reject': return 'close-circle';
      case 'new_bid': case 'bid': return 'pricetag';
      case 'message': case 'new_message': return 'chatbubble';
      case 'payment': case 'payment_received': return 'card';
      case 'cancel': case 'booking_cancelled': return 'close-circle';
      default:
        if (source === 'booking') return 'calendar';
        if (source === 'request') return 'document-text';
        return 'notifications';
    }
  };

  const getIconColor = (type: string, isRead: boolean) => {
    if (isRead) return '#6B7280';
    switch (type) {
      case 'accept': return '#16A34A';
      case 'reject': case 'cancel': return '#DC2626';
      default: return '#2563EB';
    }
  };

  const getIconBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-100';
    switch (type) {
      case 'accept': return 'bg-green-100';
      case 'reject': case 'cancel': return 'bg-red-100';
      default: return 'bg-blue-100';
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
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : notifications.length === 0 ? (
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
                onPress={() => handleTap(notification)}
                className={`${
                  notification.isRead ? 'bg-white' : 'bg-blue-50'
                } rounded-xl p-4 mb-3 shadow-sm`}
              >
                <View className="flex-row">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getIconBg(notification.type, notification.isRead)}`}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type, notification.source) as any}
                      size={20}
                      color={getIconColor(notification.type, notification.isRead)}
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
                      <View className="flex-row items-center ml-2">
                        {!notification.isRead && (
                          <View className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1" />
                        )}
                        <TouchableOpacity onPress={() => handleDelete(notification.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
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
      {/* <View className="bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          onPress={() => router.push('/(account)/notifications')}
          className="flex-row items-center justify-center"
        >
          <Ionicons name="settings-outline" size={20} color="#2563EB" />
          <Text className="text-primary-500 font-medium ml-2">Notification Settings</Text>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
}
