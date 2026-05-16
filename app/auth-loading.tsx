import { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { useAppDispatch } from '../src/store/hooks';
import { loginSuccess, loginFailure, logout, setInstallationId } from '../src/store/slices/authSlice';
import { setUser } from '../src/store/slices/userSlice';
import { hasCompletedOnboarding, getRefreshToken, saveRefreshToken, removeRefreshToken, getInstallationId, saveInstallationId } from '../src/utils/storage';
import { registerDevicePushToken } from '../src/utils/notifications';
import { config } from '@/src/utils/apiConfig';

const API_BASE_URL = config.domain_url;

export default function AuthLoading() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 90 });
    opacity.value = withTiming(1, { duration: 700 });

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    // Load (or register) the backend installation ID
    let installationId = await getInstallationId();
    if (!installationId) {
      try {
        const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
        const installRes = await fetch(`${API_BASE_URL}/installations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_type: deviceType,
            user_role: 'client',
            device_name: Device.deviceName ?? 'Unknown',
          }),
        });
        if (installRes.ok) {
          const installData = await installRes.json();
          if (installData?.data?.installation_id) {
            installationId = installData.data.installation_id as string;
            await saveInstallationId(installationId);
          }
        }
      } catch {
        // Non-critical — continue without installation ID
      }
    }
    if (installationId) {
      dispatch(setInstallationId(installationId));
    }

    try {
      const onboardingComplete = await hasCompletedOnboarding();

      if (!onboardingComplete) {
        setTimeout(() => {
          router.replace('/(onboarding)/intro');
        }, 1000);
        return;
      }

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        // No session — let user browse as guest
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 1000);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        await removeRefreshToken();
        dispatch(logout());
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 500);
        return;
      }

      const res = await response.json();

      if (!res.success || !res.data) {
        throw new Error('Invalid response structure');
      }

      const user = res.data.user;

      if (user.role !== 'client') {
        await removeRefreshToken();
        dispatch(logout());
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 500);
        return;
      }

      await saveRefreshToken(res.data.refresh_token);

      dispatch(loginSuccess({ accessToken: res.data.access_token }));

      // Register push token (fire-and-forget, non-critical)
      void registerDevicePushToken();

      dispatch(setUser({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profileImage: user.profile_picture_url ?? undefined,
        isEmailVerified: user.email_verified,
        isPhoneVerified: user.phone_verified,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      }));

      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 500);

    } catch (error: any) {
      console.error('Auth check failed:', error);
      dispatch(loginFailure(error?.message || 'Auth check failed'));
      await removeRefreshToken();
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 500);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <StatusBar style="dark" />

      <Animated.View style={animatedStyle} className="items-center">
        <Image
          source={require('../assets/splash-icon.png')}
          style={{ width: 220, height: 220 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
