import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Linking } from 'react-native';
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
  UserIcon,
} from 'react-native-heroicons/outline';
import { useAppDispatch } from '../../src/store/hooks';
import { validateEmail, validatePhone, validateName, validatePassword, validateConfirmPassword } from '../../src/utils/validation';
import { signInWithGoogle } from '../../src/utils/googleAuth';
import KeyboardAvoidingWrapper from '@/src/componets/common/KeyboardAvoidingWrapper';
import { apiRequests } from '@/src/utils/apiRequests';

type TabType = 'email' | 'phone';

function getFlagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function RegisterScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const dispatch = useAppDispatch();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };
  const [activeTab, setActiveTab] = useState<TabType>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Error states
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setFullNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setServerError('');

    // Validate full name
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      isValid = false;
    } else {
      const nameCheck = validateName(fullName);
      if (!nameCheck.isValid) {
        setFullNameError(nameCheck.error || 'Invalid name');
        isValid = false;
      }
    }

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

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else {
      const confirmCheck = validateConfirmPassword(password, confirmPassword);
      if (!confirmCheck.isValid) {
        setConfirmPasswordError(confirmCheck.error || 'Passwords do not match');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setServerError('');
    const result = await signInWithGoogle(dispatch, (msg) => setServerError(msg));
    setIsGoogleLoading(false);
    if (result === 'success') {
      router.replace((returnTo as any) ?? '/(tabs)/home');
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const payload: Record<string, string> = {
        full_name: fullName.trim(),
        password,
        role: 'client',
      };
      if (activeTab === 'email') {
        payload.email = email.trim();
      } else {
        payload.phone = phone.replace(/\D/g, '');
      }

      const response = await apiRequests.post('/auth/register', payload);
      const res = response.data;

      if (res.success && res.data) {
        const { channel, address, temp_token } = res.data as { channel: 'email' | 'phone'; address: string; temp_token: string };
        router.push({
          pathname: '/(auth)/verify-email',
          params: { token: temp_token, address, channel },
        });
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setPhone('');
      setPhoneError('');
      return;
    }
    const formatted = new AsYouType().input('+' + digits);
    setPhone(formatted);
    setPhoneError('');
  };

  const detectedCountry = phone
    ? parsePhoneNumberFromString(phone)?.country
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]">
      <StatusBar style="auto" />

      <KeyboardAvoidingWrapper>
        {/* Header Section */}
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
            <Text className="text-white text-2xl font-bold">Create Account</Text>
            <Text className="text-white/80 text-sm mt-1">Sign up to get started</Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View className="px-6 -mt-6">
          <View className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-lg">
            
            {/* Server Error Badge */}
            {serverError ? (
              <View className="bg-error/10 border border-error rounded-xl px-4 py-3 mb-4">
                <Text className="text-error text-center font-medium text-sm">{serverError}</Text>
              </View>
            ) : null}

            {/* Tab Toggle */}
            {/*
            <View className="flex-row bg-gray-100 dark:bg-[#0F172A] rounded-full p-1 mb-6">
              <TouchableOpacity
                onPress={() => {
                  setActiveTab('email');
                  setEmailError('');
                  setPhoneError('');
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
            */}

            {/* Full Name Input */}
            <View className="mb-4">
              <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </Text>
              <View className={`flex-row items-center bg-gray-50 dark:bg-[#0F172A] border ${
                fullNameError ? 'border-error' : 'border-gray-200 dark:border-[#334155]'
              } rounded-xl px-4`}>
                <UserIcon size={20} color="#6B7280" />
                <TextInput
                  placeholder="Enter name"
                  placeholderTextColor="#6B7280"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    setFullNameError('');
                  }}
                  returnKeyType="next"
                  className="flex-1 py-4 ml-3 text-gray-900 dark:text-white"
                />
              </View>
              {fullNameError ? (
                <Text className="text-error text-xs mt-1 ml-1">{fullNameError}</Text>
              ) : null}
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
                    placeholder="Enter email"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError('');
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
            {/*
            {activeTab === 'phone' && (
              <>
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

              </>
            )}
            */}

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
                  placeholder="Create a password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
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

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </Text>
              <View className={`flex-row items-center bg-gray-50 dark:bg-[#0F172A] border ${
                confirmPasswordError ? 'border-error' : 'border-gray-200 dark:border-[#334155]'
              } rounded-xl px-4`}>
                <LockClosedIcon size={20} color="#6B7280" />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="#6B7280"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  className="flex-1 py-4 ml-3 text-gray-900 dark:text-white"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeSlashIcon size={20} color="#6B7280" />
                  ) : (
                    <EyeIcon size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? (
                <Text className="text-error text-xs mt-1 ml-1">{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity 
              onPress={handleRegister}
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
                  <Text className="text-white font-bold text-lg">Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Google Sign Up */}
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              disabled={isGoogleLoading}
              activeOpacity={0.8}
              className="border-2 border-gray-200 dark:border-[#334155] py-4 rounded-full items-center mt-4"
            >
              {isGoogleLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
                <Text className="text-gray-700 dark:text-gray-300 font-medium">Sign up with Google</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/login', params: returnTo ? { returnTo } : {} })}>
              <Text className="text-tertiary-500 font-bold">Login</Text>
            </TouchableOpacity>
          </View>

          {/* Terms & Privacy */}
          <TouchableOpacity
            onPress={() => Linking.openURL('https://lookerservice.com/privacy-policy')}
            className="items-center mt-4 mb-8"
          >
            <Text className="text-gray-400 text-xs">Terms & Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingWrapper>

    </SafeAreaView>
  );
}