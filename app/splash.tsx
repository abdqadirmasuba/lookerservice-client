import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withTiming(1, { duration: 600 });

    // Navigate to auth loading after splash
    const timer = setTimeout(() => {
      router.replace('/auth-loading');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <LinearGradient
      colors={['#2DA9E9', '#1E88C7']}
      className="flex-1"
    >
      <StatusBar style="light" />
      
      <View className="flex-1 items-center justify-center">
        <Animated.View style={animatedStyle} className="items-center">
          {/* Logo Container */}
          <View className="w-32 h-32 bg-white/20 rounded-3xl items-center justify-center mb-6 backdrop-blur-lg shadow-2xl">
            <View className="w-28 h-28 bg-white rounded-2xl items-center justify-center shadow-lg">
              <Text className="text-primary-500 text-5xl font-bold tracking-tighter">LS</Text>
            </View>
          </View>

          {/* App Name */}
          <Text className="text-white text-3xl font-bold mb-2 tracking-wide">LookerService</Text>
          <Text className="text-white/90 text-lg font-medium">Client</Text>
          <Text className="text-white/70 text-sm mt-2">Find Trusted Service Providers</Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <View className="absolute bottom-20 self-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white/60 text-xs mt-4">v1.0.0</Text>
      </View>
    </LinearGradient>
  );
}