import { StatusBar } from 'expo-status-bar';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '@/components';

export default function HomeScreen() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar style="auto" />
      
      <View className="pt-16 px-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Welcome
          </Text>
          <Text className="text-lg text-gray-600">
            Your Expo app with NativeWind is ready to go!
          </Text>
        </View>

        {/* Card Example */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-xl font-semibold text-gray-900 mb-3">
            Getting Started
          </Text>
          <Text className="text-gray-600 mb-4 leading-6">
            This is an example screen component. You can use Tailwind classes 
            to style your components just like you would in a web application.
          </Text>
          <Button 
            title="Get Started" 
            onPress={handlePress}
            variant="primary"
          />
        </View>

        {/* Features Grid */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Features
          </Text>
          
          <View className="flex-row flex-wrap -mx-2">
            {['TypeScript', 'NativeWind', 'Expo', 'Hot Reload'].map((feature) => (
              <View key={feature} className="w-1/2 px-2 mb-4">
                <View className="bg-white rounded-xl p-4 shadow-sm">
                  <Text className="text-lg font-semibold text-gray-900 text-center">
                    {feature}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
