import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from 'react-native-heroicons/outline';
import { useAppDispatch } from '../../src/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../../src/store/slices/authSlice';
import { setUser } from '../../src/store/slices/userSlice';
import { saveRefreshToken } from '../../src/utils/storage';
import { validateEmail, validatePhone, validatePassword } from '../../src/utils/validation';
import { showRequiredFieldAlert } from '../../src/utils/alerts';
import { apiRequests } from '@/src/utils/apiRequests';
import { signInWithGoogle } from '../../src/utils/googleAuth';
import { ensureInstallationRegistered } from '../../src/utils/installation';
import KeyboardAvoidingWrapper from '@/src/componets/common/KeyboardAvoidingWrapper';

type TabType = 'email' | 'phone';

function getFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function LoginScreen() {
  const router = useRouter();
  const { verified, message, returnTo } = useLocalSearchParams<{ verified?: string; message?: string; returnTo?: string }>();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Error states
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setServerError('');

    // Validate email or phone based on active tab
    if (activeTab === 'email') {
      if (!email.trim()) {
        setEmailError('Email is required');
        isValid = false;
      } else {
        const emailCheck = validateEmail(email);
        if (!emailCheck.isValid) {
          setEmailError(emailCheck.error || 'Invalid email');
          isValid = false;
        }
      }
    } else {
      if (!phone.trim()) {
        setPhoneError('Phone number is required');
        isValid = false;
      } else {
        const phoneCheck = validatePhone(phone);
        if (!phoneCheck.isValid) {
          setPhoneError(phoneCheck.error || 'Invalid phone number');
          isValid = false;
        }
      }
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.isValid) {
        setPasswordError(passwordCheck.error || 'Invalid password');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    if (activeTab === 'email') {
      if (!email.trim()) {
        showRequiredFieldAlert('Email address');
        return;
      }
      if (!password) {
        showRequiredFieldAlert('Password');
        return;
      }
    }
    if (activeTab === 'phone') {
      if (!phone.trim()) {
        showRequiredFieldAlert('Phone number');
        return;
      }
      if (!password) {
        showRequiredFieldAlert('Password');
        return;
      }
    }


    setIsLoading(true);
    dispatch(loginStart());

    try {
      try {
        await ensureInstallationRegistered('client');
      } catch (setupError) {
        console.warn('Installation registration at login failed:', setupError);
      }

      const data = activeTab === 'email' ? { email, password } : { phone: phone.replace(/\D/g, ''), password };
      const response = await apiRequests.post('/auth/login', data);
      const res = response.data;
      if (res.success && res.data) {
        const user = res.data.user;

        // Only allow client role
        if (user.role !== 'client') {
          throw new Error('User not supported');
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
          profileImage: user.profile_picture_url ?? undefined,
          isEmailVerified: user.email_verified,
          isPhoneVerified: user.phone_verified,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at,
        }));

        // Navigate back to origin or home
        router.replace((returnTo as any) ?? '/(tabs)/home');
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (error: any) {
      const responseData = error.response?.data;
      const errorMessage =
        responseData?.error?.details?.error ||
        responseData?.error?.message ||
        responseData?.message ||
        error.message ||
        'Invalid credentials. Please try again.';
      dispatch(loginFailure(errorMessage));
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerError('');
    const result = await signInWithGoogle(dispatch, (msg) => setServerError(msg));
    setIsGoogleLoading(false);
    if (result === 'success') {
      router.replace((returnTo as any) ?? '/(tabs)/home');
    }
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setPhone('');
      setPhoneError('');
      setServerError('');
      return;
    }
    const formatted = new AsYouType().input('+' + digits);
    setPhone(formatted);
    setPhoneError('');
    setServerError('');
  };

  const detectedCountry = phone
    ? parsePhoneNumberFromString(phone)?.country
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]">
      <StatusBar style="auto" />

      <KeyboardAvoidingWrapper>
        <LinearGradient
          colors={['#2DA9E9', '#1E88E5']}
          className="px-6 pt-8 pb-12 rounded-b-[40px]"
        >
          <TouchableOpacity
            onPress={handleClose}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={26} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <View className="items-center mt-4">
            <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm" style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' }}>
              <Image
                source={require('../../assets/icon.png')}
                style={{ width: 64, height: 64, borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>
            <Text className="text-white text-2xl font-bold">Welcome Back</Text>
            <Text className="text-white/80 text-sm mt-1">Sign in to continue</Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 -mt-6">
          <View className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-lg">
            
            {/* Verified Success Banner */}
            {verified === 'true' ? (
              <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                <Text className="text-green-700 text-center font-medium text-sm">✅ {message || 'Account verified! You can now log in.'}</Text>
              </View>
            ) : null}

            {/* Server Error Badge */}
            {serverError ? (
              <View className="bg-error/10 border border-error rounded-xl px-4 py-3 mb-4">
                <Text className="text-error text-center font-medium text-sm">{serverError}</Text>
              </View>
            ) : null}

            {/* Tab Toggle */}
            <View className="flex-row bg-gray-100 dark:bg-[#0F172A] rounded-full p-1 mb-6">
              <TouchableOpacity
                onPress={() => {
                  setActiveTab('email');
                  setEmailError('');
                  setPhoneError('');
                  setServerError('');
                }}
                className={`flex-1 py-3 rounded-full flex-row items-center justify-center ${
                  activeTab === 'email' ? 'bg-tertiary-500' : ''
                }`}
              >
                <EnvelopeIcon size={18} color={activeTab === 'email' ? '#FFF' : '#6B7280'} />
                <Text className={`ml-2 font-semibold ${
                  activeTab === 'email' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setActiveTab('phone');
                  setEmailError('');
                  setPhoneError('');
                  setServerError('');
                }}
                className={`flex-1 py-3 rounded-full flex-row items-center justify-center ${
                  activeTab === 'phone' ? 'bg-tertiary-500' : ''
                }`}
              >
                <PhoneIcon size={18} color={activeTab === 'phone' ? '#FFF' : '#6B7280'} />
                <Text className={`ml-2 font-semibold ${
                  activeTab === 'phone' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Tab */}
            {activeTab === 'email' && (
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Text>
                <View className={`flex-row items-center bg-gray-50 dark:bg-[#0F172A] border ${
                  emailError ? 'border-error' : 'border-gray-200 dark:border-[#334155]'
                } rounded-xl px-4`}>
                  <EnvelopeIcon size={20} color="#6B7280" />
                  <TextInput
                    placeholder="your@email.com"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
                      setServerError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    className="flex-1 py-4 ml-3 text-gray-900 dark:text-white"
                  />
                </View>
                {emailError ? (
                  <Text className="text-error text-xs mt-1 ml-1">{emailError}</Text>
                ) : null}
              </View>
            )}

            {/* Phone Tab */}
            {activeTab === 'phone' && (
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </Text>
                <View className={`flex-row items-center bg-gray-50 dark:bg-[#0F172A] border ${
                  phoneError ? 'border-error' : 'border-gray-200 dark:border-[#334155]'
                } rounded-xl px-4`}>
                  {detectedCountry ? (
                    <Text style={{ fontSize: 22, lineHeight: 26 }}>{getFlagEmoji(detectedCountry)}</Text>
                  ) : (
                    <PhoneIcon size={20} color="#6B7280" />
                  )}
                  <TextInput
                    placeholder="Include country code"
                    placeholderTextColor="#6B7280"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    className="flex-1 py-4 ml-3 text-gray-900 dark:text-white"
                  />
                </View>
                {phoneError ? (
                  <Text className="text-error text-xs mt-1 ml-1">{phoneError}</Text>
                ) : null}
              </View>
            )}

            {/* Password Input */}
            <View className="mb-4">
              <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Password
              </Text>
              <View className={`flex-row items-center bg-gray-50 dark:bg-[#0F172A] border ${
                passwordError ? 'border-error' : 'border-gray-200 dark:border-[#334155]'
              } rounded-xl px-4`}>
                <LockClosedIcon size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                    setServerError('');
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  className="flex-1 py-4 ml-3 text-gray-900 dark:text-white"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeSlashIcon size={20} color="#6B7280" />
                  ) : (
                    <EyeIcon size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text className="text-error text-xs mt-1 ml-1">{passwordError}</Text>
              ) : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/forgot-password')}
              className="items-end mb-6"
            >
              <Text className="text-tertiary-500 font-medium">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#F57C1F', '#E65100']}
                className="py-4 rounded-full items-center shadow-lg"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200 dark:bg-[#334155]" />
              <Text className="mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</Text>
              <View className="flex-1 h-px bg-gray-200 dark:bg-[#334155]" />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={isGoogleLoading}
              activeOpacity={0.8}
              className="border-2 border-gray-200 dark:border-[#334155] py-4 rounded-full items-center flex-row justify-center"
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Text className="text-gray-700 dark:text-gray-300 font-medium">Continue with Google</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/register', params: returnTo ? { returnTo } : {} })}>
              <Text className="text-tertiary-500 font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Terms & Privacy */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://lookerservice.com/privacy-policy/provider')}
            className="items-center mt-4 mb-8"
          >
            <Text className="text-gray-400 text-xs">Terms & Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}