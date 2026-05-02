import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
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
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  const handleLogout = () => {
    showLogoutConfirm(async () => {
      await clearAllStorage();  
      dispatch(logout());
      dispatch(clearUser());
      await GoogleSignin.signOut();
      
      router.replace('/(tabs)/home');
    });
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { label: 'My Profile', route: '/(account)/profile', icon: '👤' },
        { label: 'Saved Addresses', route: '/(account)/addresses', icon: '📍' },
      ],
    },
    // {
    //   title: 'Payments',
    //   items: [
    //     { label: 'Payment Methods', route: '/(account)/payment-methods', icon: '💳' },
    //   ],
    // },
    {
      title: 'Support',
      items: [
        { label: 'Help & Support', route: '/(account)/help', icon: '❓' },
        { label: 'Terms & Privacy', route: '/(account)/terms', icon: '📄' },
      ],
    },
    {
      title: 'Account Settings',
      items: [
        { label: 'Account Settings', route: '/(account)/account-settings', icon: '⚙️' },
      ],
    },
  ];

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-6 py-8 bg-primary-50 items-center">
          <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">My Account</Text>
          <Text className="text-gray-500 text-sm">Sign in to access your account</Text>
        </View>
        <View className="flex-1 px-6 justify-center">
          <Text className="text-lg font-bold text-gray-900 text-center mb-2">
            Sign In Required
          </Text>
          <Text className="text-sm text-gray-500 text-center leading-5 mb-8">
            Create an account or log in to manage your profile, addresses and settings.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="w-full py-3.5 rounded-2xl items-center mb-3"
            style={{ backgroundColor: '#2DA9E9' }}
            activeOpacity={0.85}
          >
            <Text className="text-white font-bold text-base">Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="w-full py-3.5 rounded-2xl items-center border border-gray-200"
            activeOpacity={0.85}
          >
            <Text className="text-gray-800 font-bold text-base">Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Profile Header */}
        <View className="px-6 py-8 bg-gradient-to-b from-primary-50">
          <View className="items-center">
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
                className="mb-4"
              />
            ) : (
              <View className="bg-primary-500 w-24 h-24 rounded-full items-center justify-center mb-4">
                <Text className="text-white text-3xl font-bold">
                  {user ? getInitials(user.fullName) : 'U'}
                </Text>
              </View>
            )}
            <Text className="text-2xl font-bold text-gray-900 mb-1">
              {user?.fullName || 'User'}
            </Text>
            <Text className="text-gray-600">{user?.email || user?.phone || ''}</Text>
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
        <View className="px-6 pt-4 pb-2">
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
