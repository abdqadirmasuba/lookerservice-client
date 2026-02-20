import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../src/store/hooks';
import { loginSuccess, logout } from '../src/store/slices/authSlice';
import { setUser } from '../src/store/slices/userSlice';
import { hasCompletedOnboarding, getRefreshToken, saveToken, saveRefreshToken } from '../src/utils/storage';
import { refreshToken as refreshTokenAPI } from '../src/services/auth.service';
import { getProfile } from '../src/services/user.service';

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
        const response = await refreshTokenAPI(refreshTokenValue);
        
        if (response.success && response.data) {
          // Save new tokens
          await saveToken(response.data.accessToken);
          await saveRefreshToken(response.data.refreshToken);
          
          // Update Redux
          dispatch(loginSuccess({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }));
          
        //   dispatch(setUser(response.data.user));
          
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
