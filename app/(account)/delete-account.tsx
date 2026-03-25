import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { clearUser } from '../../src/store/slices/userSlice';
import { clearAllStorage } from '../../src/utils/storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

type Step = 'warning' | 'sending' | 'verify' | 'deleting' | 'done';

const CODE_LENGTH = 6;

export default function DeleteAccountScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const [step, setStep] = useState<Step>('warning');
  const [confirmText, setConfirmText] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const channel = user?.email ? 'email' : 'phone';
  const address = user?.email ?? user?.phone ?? '';
  const maskedAddress = maskAddress(address, channel);

  /* ── Step 1: send code ───────────────────────────────── */
  const handleRequestCode = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    setError('');
    setStep('sending');
    try {
      // TODO: call DELETE /client/account/request-deletion
      // await apiRequests.post('/client/account/request-deletion');
      await new Promise((r) => setTimeout(r, 1200)); // simulate network
      setStep('verify');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to send code. Try again.');
      setStep('warning');
    }
  };

  /* ── Step 2: verify code ────────────────────────────── */
  const fullCode = code.join('');

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyAndDelete = async () => {
    if (fullCode.length < CODE_LENGTH) {
      setError(`Please enter the ${CODE_LENGTH}-digit code`);
      return;
    }
    setError('');
    setStep('deleting');
    try {
      // TODO: call DELETE /client/account/confirm-deletion  with { code: fullCode }
      // await apiRequests.delete('/client/account/confirm-deletion', { data: { code: fullCode } });
      await new Promise((r) => setTimeout(r, 1500)); // simulate network
      await clearAllStorage();
      dispatch(logout());
      dispatch(clearUser());
      await GoogleSignin.signOut().catch(() => {});
      setStep('done');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Invalid code. Please try again.');
      setStep('verify');
    }
  };

  /* ── Render ─────────────────────────────────────────── */

  if (step === 'done') {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <Text className="text-5xl mb-4">👋</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Account Deleted</Text>
        <Text className="text-gray-500 text-center mb-8 leading-5">
          Your account and all associated data have been permanently removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="bg-primary-500 px-8 py-4 rounded-xl w-full items-center"
        >
          <Text className="text-white font-bold text-base">Back to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40 }}>

          {/* ── WARNING STEP ──────────────────────────────── */}
          {(step === 'warning' || step === 'sending') && (
            <>
              {/* Danger icon */}
              <View className="items-center mb-6 mt-4">
                <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Text className="text-4xl">⚠️</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center">Delete Account</Text>
                <Text className="text-gray-500 text-center mt-1 text-sm">
                  This action is permanent and cannot be undone
                </Text>
              </View>

              {/* Consequences */}
              <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <Text className="text-red-700 font-semibold mb-3">What will be deleted:</Text>
                {[
                  'Your profile and personal information',
                  'All your booking history',
                  'Saved addresses and payment methods',
                  'Service requests and bids',
                  'Messages with providers',
                ].map((item, i) => (
                  <View key={i} className="flex-row items-start mb-2">
                    <Text className="text-red-400 mr-2 mt-0.5">✕</Text>
                    <Text className="text-red-600 text-sm flex-1">{item}</Text>
                  </View>
                ))}
              </View>

              {/* Confirm intent */}
              <View className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
                <Text className="text-gray-700 font-medium mb-2">
                  Type <Text className="font-bold text-red-600">DELETE</Text> to confirm
                </Text>
                <TextInput
                  value={confirmText}
                  onChangeText={(t) => { setConfirmText(t); setError(''); }}
                  placeholder="Type DELETE here"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                  className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 text-base tracking-widest"
                />
                {error ? (
                  <Text className="text-red-600 text-xs mt-2 ml-1">{error}</Text>
                ) : null}
              </View>

              <Text className="text-gray-400 text-xs text-center mb-5 leading-4">
                A verification code will be sent to your {channel === 'email' ? 'email' : 'phone'} ({maskedAddress}) to confirm deletion.
              </Text>

              {/* Buttons */}
              <TouchableOpacity
                onPress={handleRequestCode}
                disabled={step === 'sending'}
                activeOpacity={0.8}
                className="py-4 rounded-xl bg-red-500 items-center mb-3"
              >
                {step === 'sending' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Send Verification Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                className="py-4 rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── VERIFY STEP ──────────────────────────────── */}
          {(step === 'verify' || step === 'deleting') && (
            <>
              <View className="items-center mb-6 mt-4">
                <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-3">
                  <Text className="text-4xl">{channel === 'email' ? '📧' : '📱'}</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center">Enter the Code</Text>
                <Text className="text-gray-500 text-center mt-2 text-sm leading-5">
                  We sent a {CODE_LENGTH}-digit code to{'\n'}
                  <Text className="font-semibold text-gray-700">{maskedAddress}</Text>
                </Text>
              </View>

              {/* OTP boxes */}
              <View className="flex-row justify-center gap-3 mb-4">
                {code.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => { inputRefs.current[i] = ref; }}
                    value={digit}
                    onChangeText={(t) => handleCodeChange(t, i)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold text-gray-900 ${
                      digit ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  />
                ))}
              </View>

              {error ? (
                <Text className="text-red-600 text-sm text-center mb-4">{error}</Text>
              ) : null}

              {/* Resend */}
              <TouchableOpacity
                onPress={() => { setStep('warning'); setCode(['', '', '', '', '', '']); setError(''); }}
                className="items-center mb-6"
              >
                <Text className="text-primary-500 text-sm font-medium">Resend code</Text>
              </TouchableOpacity>

              {/* Delete button */}
              <TouchableOpacity
                onPress={handleVerifyAndDelete}
                disabled={step === 'deleting' || fullCode.length < CODE_LENGTH}
                activeOpacity={0.8}
                className={`py-4 rounded-xl items-center mb-3 ${
                  fullCode.length < CODE_LENGTH ? 'bg-gray-200' : 'bg-red-500'
                }`}
              >
                {step === 'deleting' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    className={`font-bold text-base ${
                      fullCode.length < CODE_LENGTH ? 'text-gray-400' : 'text-white'
                    }`}
                  >
                    Verify &amp; Delete My Account
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                className="py-4 rounded-xl border border-gray-200 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── helpers ─────────────────────────────────────────────── */

function maskAddress(address: string, channel: 'email' | 'phone'): string {
  if (!address) return '—';
  if (channel === 'email') {
    const [local, domain] = address.split('@');
    if (!domain) return address;
    const masked = local.slice(0, 2) + '****';
    return `${masked}@${domain}`;
  }
  // phone
  return address.slice(0, 4) + '****' + address.slice(-3);
}
