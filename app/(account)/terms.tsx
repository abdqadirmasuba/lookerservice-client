import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Linking } from 'react-native';

const PRIVACY_URL = 'https://lookerservice.com/privacy-policy/provider';

export default function TermsScreen() {
  useEffect(() => {
    Linking.openURL(PRIVACY_URL);
  }, []);

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      <ActivityIndicator size="large" color="#F57C1F" />
      <Text className="text-gray-600 mt-4 text-center text-base">
        Opening Terms & Privacy Policy…
      </Text>
    </View>
  );
}
