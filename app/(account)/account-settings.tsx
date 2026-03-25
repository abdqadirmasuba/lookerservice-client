import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../src/store/hooks';
import { getInitials } from '../../src/utils/formatters';

type MenuItem = {
  label: string;
  sublabel?: string;
  route: string;
  icon: string;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'My Profile',
    sublabel: 'View and edit your personal info',
    route: '/(account)/profile',
    icon: '👤',
  },
  {
    label: 'Change Password',
    sublabel: 'Update your account password',
    route: '/(account)/change-password',
    icon: '🔑',
  },
  {
    label: 'Notification Preferences',
    sublabel: 'Manage push & email alerts',
    route: '/(account)/notifications',
    icon: '🔔',
  },
  {
    label: 'Delete Account',
    sublabel: 'Permanently remove your account',
    route: '/(account)/delete-account',
    icon: '🗑️',
    danger: true,
  },
];

export default function AccountSettingsScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Mini profile strip */}
        <View className="flex-row items-center bg-white px-5 py-4 border-b border-gray-100 mb-4">
          <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-4">
            <Text className="text-white font-bold text-lg">
              {getInitials(user?.fullName ?? 'U')}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base">{user?.fullName ?? 'User'}</Text>
            <Text className="text-gray-400 text-sm">{user?.email ?? user?.phone ?? ''}</Text>
          </View>
        </View>

        {/* Menu */}
        <View className="mx-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
              className={`flex-row items-center px-5 py-4 ${
                i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              {/* Icon bubble */}
              <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                  item.danger ? 'bg-red-50' : 'bg-gray-100'
                }`}
              >
                <Text className="text-xl">{item.icon}</Text>
              </View>

              {/* Labels */}
              <View className="flex-1">
                <Text
                  className={`font-medium text-base ${
                    item.danger ? 'text-red-500' : 'text-gray-900'
                  }`}
                >
                  {item.label}
                </Text>
                {item.sublabel ? (
                  <Text className="text-xs text-gray-400 mt-0.5">{item.sublabel}</Text>
                ) : null}
              </View>

              <Text className={item.danger ? 'text-red-300' : 'text-gray-300'}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
