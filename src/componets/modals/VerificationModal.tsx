import { Modal, View, Text, TouchableOpacity, Linking } from 'react-native';

interface Props {
  visible: boolean;
  channel: 'email' | 'phone';
  address: string;
  message: string;
  onClose: () => void;
  onGoToLogin: () => void;
}

function openMailClient(address: string) {
  Linking.openURL(`mailto:${address}`).catch(() => {
    // mail client not available — silently ignore
  });
}

function openWhatsApp(phone: string) {
  // Strip any non-digit chars except leading + then remove +
  const digits = phone.replace(/\D/g, '');
  Linking.openURL(`https://wa.me/${digits}`).catch(() => {
    // WhatsApp not installed — silently ignore
  });
}

export default function VerificationModal({
  visible,
  channel,
  address,
  message,
  onClose,
  onGoToLogin,
}: Props) {
  const isEmail = channel === 'email';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full shadow-2xl">
          {/* Icon */}
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: isEmail ? '#EFF6FF' : '#F0FDF4' }}>
              <Text className="text-4xl">{isEmail ? '📧' : '📱'}</Text>
            </View>

            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
              {isEmail ? 'Verify your email' : 'Verify your phone'}
            </Text>
          </View>

          {/* API message */}
          <Text className="text-sm text-gray-600 dark:text-gray-300 text-center mb-2 leading-5">
            {message}
          </Text>

          {/* Address highlight */}
          <View className="bg-gray-50 dark:bg-[#0F172A] rounded-xl px-4 py-3 mb-5">
            <Text className="text-sm font-semibold text-center text-gray-800 dark:text-gray-200">
              {address}
            </Text>
          </View>

          {/* Open action button */}
          <TouchableOpacity
            onPress={() =>
              isEmail ? openMailClient(address) : openWhatsApp(address)
            }
            activeOpacity={0.8}
            className="py-4 rounded-full items-center mb-3"
            style={{ backgroundColor: isEmail ? '#1E88E5' : '#25D366' }}
          >
            <Text className="text-white font-bold text-base">
              {isEmail ? '📬  Open Mail App' : '💬  Open WhatsApp'}
            </Text>
          </TouchableOpacity>

          {/* Go to Login */}
          <TouchableOpacity
            onPress={onGoToLogin}
            activeOpacity={0.8}
            className="py-4 rounded-full items-center mb-3 bg-indigo-500"
          >
            <Text className="text-white font-bold text-base">Go to Login</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          {/* <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="py-3 rounded-full items-center border border-gray-200 dark:border-[#334155]"
          >
            <Text className="text-gray-600 dark:text-gray-400 font-medium">Dismiss</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
}
