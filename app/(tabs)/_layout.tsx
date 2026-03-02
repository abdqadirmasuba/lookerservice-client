import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

// Simple icon components (you can replace with actual icons later)
const HomeIcon = ({ color }: { color: string }) => (
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
);

const SearchIcon = ({ color }: { color: string }) => (
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
);

const RequestsIcon = ({ color }: { color: string }) => (
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
);

const BookingsIcon = ({ color }: { color: string }) => (
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
);

const AccountIcon = ({ color }: { color: string }) => (
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2DA9E9',
        tabBarInactiveTintColor: '#64748B',
        // tabBarStyle: {
        //   backgroundColor: '#FFFFFF',
        //   borderTopColor: '#E2E8F0',
        //   height: 65,
        //   paddingBottom: 10,
        //   paddingTop: 5,
        // },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <SearchIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <RequestsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <BookingsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <AccountIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
