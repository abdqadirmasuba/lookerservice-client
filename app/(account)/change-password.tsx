import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiRequests } from '../../src/utils/apiRequests';
import { validatePassword } from '../../src/utils/validation';

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!oldPassword.trim()) {
      setError('Current password is required.');
      return;
    }

    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.isValid) {
      setError(pwCheck.error ?? 'New password is not strong enough.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    try {
      setLoading(true);
      await apiRequests.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        'Failed to change password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-green-50 border border-green-200 rounded-2xl p-8 items-center w-full">
          <Text className="text-5xl mb-4">✅</Text>
          <Text className="text-xl font-bold text-green-800 mb-2">Password Updated</Text>
          <Text className="text-green-700 text-center mb-6">
            Your password has been changed successfully.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-green-600 rounded-xl px-8 py-3"
          >
            <Text className="text-white font-semibold">Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* Info card */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
          <Text className="text-blue-700 text-sm">
            Choose a strong password that you don't use for other websites.
          </Text>
        </View>

        {/* Error banner */}
        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        {/* Current Password */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">Current Password</Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 mb-5">
          <TextInput
            className="flex-1 py-3.5 text-gray-900 text-base"
            placeholder="Enter current password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showOld}
            value={oldPassword}
            onChangeText={setOldPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowOld(!showOld)} hitSlop={8}>
            <Text className="text-gray-400 text-sm">{showOld ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        {/* New Password */}
        <Text className="text-sm font-medium text-gray-700 mb-1.5">New Password</Text>
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 mb-2">
          <TextInput
            className="flex-1 py-3.5 text-gray-900 text-base"
            placeholder="Enter new password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={8}>
            <Text className="text-gray-400 text-sm">{showNew ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-400 mb-8">
          Minimum 8 characters, with at least one letter and one number.
        </Text>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
          className={`rounded-xl py-4 items-center ${loading ? 'bg-primary-300' : 'bg-primary-500'}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
