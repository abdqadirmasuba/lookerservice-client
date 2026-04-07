import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import KeyboardAvoidingWrapper from '@/src/componets/common/KeyboardAvoidingWrapper';
import { apiRequests } from '@/src/utils/apiRequests';

const ORANGE = '#F57C1F';
const ORANGE_DARK = '#E65100';
const CODE_LENGTH = 6;

export default function VerifyEmail() {
  const router = useRouter();
  const { token, address, channel } = useLocalSearchParams<{
    token: string;
    address: string;
    channel: string;
  }>();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleDigitChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = '';
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await apiRequests.postheaders(
        '/auth/verify-otp',
        { code },
        { Authorization: `Bearer ${token}` },
      );
      const res = response.data;
      if (res.success) {
        router.replace({
          pathname: '/(auth)/login',
          params: { verified: 'true', message: res.message || 'Account verified! You can now log in.' },
        });
      } else {
        setError(res.message || 'Verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Verification failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]">
      <StatusBar style="auto" />

      <KeyboardAvoidingWrapper>
        {/* Header */}
        <LinearGradient
          colors={['#2DA9E9', '#1E88E5']}
          className="px-6 pt-8 pb-12 rounded-b-[40px]"
        >
          <View className="items-center mt-4">
            <View
              className="w-20 h-20 rounded-2xl items-center justify-center mb-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text style={{ fontSize: 40 }}>{channel === 'phone' ? '📱' : '📧'}</Text>
            </View>
            <Text className="text-white text-2xl font-bold">
              {channel === 'phone' ? 'Verify Your Phone' : 'Verify Your Email'}
            </Text>
            <Text className="text-white/80 text-sm mt-1">
              Enter the 6-digit code sent to you
            </Text>
          </View>
        </LinearGradient>

        {/* Card */}
        <View className="px-6 -mt-6">
          <View className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-lg">
            {/* Destination info */}
            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6 leading-5">
              {channel === 'phone' ? 'We sent a code via SMS to' : 'We sent a verification code to'}{' '}{'\n'}
              <Text className="font-semibold text-gray-800 dark:text-gray-200">
                {address}
              </Text>
            </Text>

            {/* Success banner removed — message shown on login screen */}

            {/* Error banner */}
            {error ? (
              <View className="bg-red-50 border border-red-400 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-600 font-medium text-center text-sm">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* OTP digit boxes */}
            <View style={styles.otpRow}>
              {digits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleDigitChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.digitBox,
                    digit ? styles.digitBoxFilled : styles.digitBoxEmpty,
                  ]}
                  editable={!isLoading}
                />
              ))}
            </View>

            {/* Verify button */}
            <TouchableOpacity
              onPress={handleVerify}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isLoading
                    ? ['#9CA3AF', '#6B7280']
                    : [ORANGE, ORANGE_DARK]
                }
                style={styles.verifyButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Code</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to login */}
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.7}
              style={styles.backLink}
            >
              <Text style={styles.backLinkText}>
                Back to{' '}
                <Text style={styles.backLinkAccent}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  digitBox: {
    width: 46,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  digitBoxEmpty: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  digitBoxFilled: {
    borderColor: ORANGE,
    backgroundColor: '#FFF7ED',
    color: '#111827',
  },
  verifyButton: {
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  backLinkAccent: {
    color: ORANGE,
    fontWeight: 'bold',
  },
  successBanner: {
    display: 'none',
  },
  successText: {
    display: 'none',
  },
});

