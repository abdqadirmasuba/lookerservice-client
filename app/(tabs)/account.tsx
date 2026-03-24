import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { clearUser } from '../../src/store/slices/userSlice';
import { clearAllStorage } from '../../src/utils/storage';
import { showLogoutConfirm } from '../../src/utils/alerts';
import { getInitials } from '../../src/utils/formatters';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function AccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  
  const handleLogout = () => {
    showLogoutConfirm(async () => {
      await clearAllStorage();  
      dispatch(logout());
      dispatch(clearUser());
      await GoogleSignin.signOut();
      
      router.replace('/(auth)/login');
    });
  };

  const menuSections = [
    {
      title: 'Profile',
      items: [
        { label: 'Edit Profile', route: '/(account)/profile', icon: '👤' },
        { label: 'Saved Addresses', route: '/(account)/addresses', icon: '📍' },
      ],
    },
    {
      title: 'Payments',
      items: [
        { label: 'Payment Methods', route: '/(account)/payment-methods', icon: '💳' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { label: 'Notifications', route: '/(account)/notifications', icon: '🔔' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & Support', route: '/(account)/help', icon: '❓' },
        { label: 'Terms & Privacy', route: '/(account)/terms', icon: '📄' },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Profile Header */}
        <View className="px-6 py-8 bg-gradient-to-b from-primary-50">
          <View className="items-center">
            <View className="bg-primary-500 w-24 h-24 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-3xl font-bold">
                {user ? getInitials(user.fullName) : 'U'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.fullName || 'User'}
            </Text>
            <Text className="text-gray-600">{user?.email || 'user@example.com'}</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={index} className="px-6 py-4">
            <Text className="text-sm font-semibold text-gray-500 uppercase mb-3">
              {section.title}
            </Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                onPress={() => router.push(item.route as any)}
                className="flex-row items-center justify-between py-4 border-b border-gray-100"
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-4">{item.icon}</Text>
                  <Text className="text-base text-gray-900">{item.label}</Text>
                </View>
                <Text className="text-gray-400">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View className="px-6 py-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 py-4 rounded-xl items-center border border-red-200"
          >
            <Text className="text-red-600 font-semibold text-base">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
