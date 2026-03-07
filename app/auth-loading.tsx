import { useEffect } from 'react';
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
import { useAppDispatch } from '../src/store/hooks';
import { loginSuccess, loginFailure, logout } from '../src/store/slices/authSlice';
import { setUser } from '../src/store/slices/userSlice';
import { hasCompletedOnboarding, getRefreshToken, saveRefreshToken, removeRefreshToken } from '../src/utils/storage';
import { config } from '@/src/utils/apiConfig';

const API_BASE_URL = config.domain_url;

export default function AuthLoading() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
    
    // Check auth status
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Step 1: Check if user has seen onboarding
      const onboardingComplete = await hasCompletedOnboarding();
      
      if (!onboardingComplete) {
        // First time user - show onboarding
        setTimeout(() => {
          router.replace('/(onboarding)/intro');
        }, 1000);
        return;
      }

      // Step 2: Check for refresh token
      const refreshToken = await getRefreshToken();
      
      if (!refreshToken) {
        // No refresh token - go to login
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1000);
        return;
      }

      // Step 3: Try to refresh authentication
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        // Refresh failed - clear token and go to login
        await removeRefreshToken();
        dispatch(logout());
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 500);
        return;
      }

      const res = await response.json();
      
      if (!res.success || !res.data) {
        throw new Error('Invalid response structure');
      }

      const user = res.data.user;

      // Step 4: Verify user role (client only)
      if (user.role !== 'client') {
        await removeRefreshToken();
        dispatch(logout());
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 500);
        return;
      }

      // Step 5: Update AsyncStorage with new refresh token
      await saveRefreshToken(res.data.refresh_token);

      // Step 6: Update Redux with access token
      dispatch(loginSuccess({
        accessToken: res.data.access_token,
      }));

      // Step 7: Update Redux with user data
      dispatch(setUser({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profile_image ?? undefined,
        isEmailVerified: user.email_verified,
        isPhoneVerified: user.phone_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      }));

      // Step 8: Navigate to main app
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 500);
      
    } catch (error: any) {
      console.error('Auth check failed:', error);
      dispatch(loginFailure(error?.message || 'Auth check failed'));
      await removeRefreshToken();
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 500);
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
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
        </Animated.View>

        <Animated.View style={textAnimatedStyle} className="items-center">
          {/* App Name */}
          <Text className="text-white text-3xl font-bold mb-2 tracking-wide">LookerService</Text>
          <Text className="text-white/90 text-lg font-medium">Client</Text>
          <Text className="text-white/70 text-sm mt-2">Find Trusted Service Providers</Text>
        </Animated.View>
      </View>

      {/* Loading Indicator */}
      <View className="absolute bottom-20 self-center items-center">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white/60 text-sm mt-4">Loading...</Text>
        <Text className="text-white/60 text-xs mt-2">v1.0.0</Text>
      </View>
    </LinearGradient>
  );
}
