import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ExpoLinking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import KeyboardAvoidingWrapper from '@/src/componets/common/KeyboardAvoidingWrapper';
import { apiRequests } from '@/src/utils/apiRequests';

const SUPPORT_PAYMENT_TEMPLATE = {
  id: 'TEST-XXX',
  currency: 'UGX',
  description: 'Testing',
  notification_id: 'ea0f99fd-9cb4-481a-b70f-da4acafcef51',
  billing_address: {
    email_address: 'john@doe.com',
  },
};

export default function SupportLookerServicesScreen() {
  const [amount, setAmount] = useState('1000');
  const [phoneNumber, setPhoneNumber] = useState('0771210855');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = ExpoLinking.createURL('/support-success');

  useEffect(() => {
    WebBrowser.warmUpAsync().catch(() => {});

    const subscription = ExpoLinking.addEventListener('url', ({ url }) => {
      if (url.includes('/support-success')) {
        WebBrowser.dismissBrowser();
      }
    });

    return () => {
      subscription.remove();
      WebBrowser.coolDownAsync().catch(() => {});
    };
  }, []);

  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/[^\d]/g, ''));
    setError('');
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text.replace(/[^\d+]/g, ''));
    setError('');
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    if (!phoneNumber.trim()) {
      setError('Enter a phone number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...SUPPORT_PAYMENT_TEMPLATE,
        amount: parsedAmount,
        callback_url: callbackUrl,
        billing_address: {
          ...SUPPORT_PAYMENT_TEMPLATE.billing_address,
          phone_number: phoneNumber.trim(),
        },
      };

      const response = await apiRequests.post('/payments/create', payload);
      const redirectUrl = response.data?.data?.redirect_url;

      if (!redirectUrl) {
        throw new Error('Payment link was not returned.');
      }

      await WebBrowser.openBrowserAsync(redirectUrl);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Could not start the payment. Please try again.';
      setError(message);
      Alert.alert('Payment Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <KeyboardAvoidingWrapper>
        <View className="px-5 pt-5 pb-8">
          <View className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: '#EAF7FD' }}
            >
              <Ionicons name="heart" size={24} color="#2DA9E9" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Support Looker Services
            </Text>
            <Text className="text-sm text-gray-500 leading-5 mb-6">
              Enter the amount and mobile money phone number to continue to Pesapal.
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Amount</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
                <Text className="text-gray-500 font-semibold mr-3">UGX</Text>
                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="number-pad"
                  placeholder="1000"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 py-4 text-gray-900"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  placeholder="0771210855"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 py-4 ml-3 text-gray-900"
                />
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: isSubmitting ? '#9CA3AF' : '#2DA9E9' }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Continue to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingWrapper>
    </SafeAreaView>
  );
}
