import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import "./global.css";

export default function App() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-blue-600 mb-4">
        Welcome to Looker Service!
      </Text>
      <Text className="text-gray-600">
        Your Expo app with NativeWind is ready 🚀
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
