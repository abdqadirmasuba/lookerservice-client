import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../src/store/hooks';
import { getInitials } from '../../src/utils/formatters';
import AuthRequiredModal from '@/src/componets/modals/AuthRequiredModal';

export default function AccountScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const menuSections = [
    {
      title: 'Account',
      items: [
        { label: 'My Profile', route: '/(account)/profile', icon: '👤' },
        // { label: 'Saved Addresses', route: '/(account)/addresses', icon: '📍' },
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
        { label: 'Support Looker Services', route: '/(account)/support-lookerservices', icon: '💳' },
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
        <View className="px-6 pt-6 pb-4 bg-primary-50 items-center">
          <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-2">
            <Text className="text-3xl">👤</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">My Account</Text>
        </View>
        <AuthRequiredModal
          visible
          onBack={() => router.back()}
          message="Sign in to manage your profile, addresses, and settings."
        />
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
                  <View className="w-8 mr-4 items-center">
                    <Text className="text-sm font-bold text-gray-500">{item.icon}</Text>
                  </View>
                  <Text className="text-base text-gray-900">{item.label}</Text>
                </View>
                <Text className="text-gray-400 text-xl">&gt;</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
