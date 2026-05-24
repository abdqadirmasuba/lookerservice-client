import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const settings = useAppSelector((state) => state.notifications.settings);
  
  const [emailEnabled, setEmailEnabled] = useState(settings?.email ?? true);
  const [smsEnabled, setSmsEnabled] = useState(settings?.sms ?? false);
  
  const [newBids, setNewBids] = useState(settings?.categories?.newBids ?? true);
  const [bookingConfirmations, setBookingConfirmations] = useState(settings?.categories?.bookingConfirmations ?? true);
  const [paymentReceipts, setPaymentReceipts] = useState(settings?.categories?.paymentReceipts ?? true);
  const [messages, setMessages] = useState(settings?.categories?.messages ?? true);
  const [promotions, setPromotions] = useState(settings?.categories?.promotions ?? false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Notification Channels */}
        <View className="bg-white px-6 py-4 mb-4">
          <Text className="text-sm font-semibold text-gray-500 uppercase mb-4">
            Notification Channels
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center flex-1">
              <Ionicons name="mail" size={20} color="#6B7280" />
              <View className="ml-3">
                <Text className="text-base text-gray-900">Email Notifications</Text>
                <Text className="text-sm text-gray-600">Receive updates via email</Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={emailEnabled ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center flex-1">
              <Ionicons name="chatbubbles" size={20} color="#6B7280" />
              <View className="ml-3">
                <Text className="text-base text-gray-900">SMS Notifications</Text>
                <Text className="text-sm text-gray-600">Receive text messages</Text>
              </View>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={smsEnabled ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Notification Categories */}
        <View className="bg-white px-6 py-4 mb-4">
          <Text className="text-sm font-semibold text-gray-500 uppercase mb-4">
            Notification Types
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base text-gray-900">New Bids</Text>
              <Text className="text-sm text-gray-600">When providers bid on your requests</Text>
            </View>
            <Switch
              value={newBids}
              onValueChange={setNewBids}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={newBids ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base text-gray-900">Booking Confirmations</Text>
              <Text className="text-sm text-gray-600">Booking status updates</Text>
            </View>
            <Switch
              value={bookingConfirmations}
              onValueChange={setBookingConfirmations}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={bookingConfirmations ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base text-gray-900">Payment Receipts</Text>
              <Text className="text-sm text-gray-600">Payment confirmations and receipts</Text>
            </View>
            <Switch
              value={paymentReceipts}
              onValueChange={setPaymentReceipts}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={paymentReceipts ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-base text-gray-900">Messages</Text>
              <Text className="text-sm text-gray-600">New messages from providers</Text>
            </View>
            <Switch
              value={messages}
              onValueChange={setMessages}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={messages ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-1">
              <Text className="text-base text-gray-900">Promotions</Text>
              <Text className="text-sm text-gray-600">Offers and promotional content</Text>
            </View>
            <Switch
              value={promotions}
              onValueChange={setPromotions}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={promotions ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 py-4 mb-8">
          <TouchableOpacity className="bg-primary-500 py-4 rounded-xl items-center">
            <Text className="text-white font-semibold text-base">Save Preferences</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
