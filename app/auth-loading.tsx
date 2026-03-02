import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { loginSuccess, logout } from '../src/store/slices/authSlice';
import { setUser } from '../src/store/slices/userSlice';
import { hasCompletedOnboarding, getRefreshToken, saveRefreshToken } from '../src/utils/storage';
import { apiRequests } from '@/src/utils/apiRequests';
export default function AuthLoading() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if onboarding is complete
      const onboardingComplete = await hasCompletedOnboarding();
      
      if (!onboardingComplete) {
        router.replace('/(onboarding)/intro');
        return;
      }

      // Check for refresh token
      const refreshTokenValue = await getRefreshToken();
      
      if (!refreshTokenValue) {
        router.replace('/(auth)/login');
        return;
      }

      // Try to refresh access token
      try {
        const response = await apiRequests.postheaders('/auth/refresh', {},
          {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshTokenValue}`,
          },
        );
        
        const res = response.data;
        if (res.success && res.data) {
          const user = res.data.user;

          // Only allow client role
          if (user.role !== 'client') {
            dispatch(logout());
            router.replace('/(auth)/login');
            return;
          }

          // Refresh token → AsyncStorage only
          await saveRefreshToken(res.data.refresh_token);

          // Access token → Redux only
          dispatch(loginSuccess({
            accessToken: res.data.access_token,
          }));

          // Hydrate Redux user state
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

          // Navigate to main app
          router.replace('/(tabs)/home');
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        // Token refresh failed, clear auth and go to login
        dispatch(logout());
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#2DA9E9" />
    </View>
  );
}
