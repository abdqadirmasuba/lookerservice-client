import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type MenuItem = {
  label: string;
  sublabel?: string;
  route: string;
  icon: string;
  danger?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
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
