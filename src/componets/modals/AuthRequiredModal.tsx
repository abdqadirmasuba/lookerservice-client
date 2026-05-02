import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AuthRequiredModalProps {
  visible: boolean;
  onDismiss: () => void;
  message?: string;
}

export default function AuthRequiredModal({
  visible,
  onDismiss,
  message = 'You need an account to access this feature.',
}: AuthRequiredModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    onDismiss();
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    onDismiss();
    router.push('/(auth)/register');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
              {/* Top accent */}
              <View className="h-1.5 bg-primary-500" />

              <View className="px-6 py-8 items-center">
                {/* Icon */}
                <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
                  <Ionicons name="lock-closed" size={30} color="#2DA9E9" />
                </View>

                {/* Title */}
                <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Account Required
                </Text>

                {/* Message */}
                <Text className="text-sm text-gray-500 text-center leading-5 mb-6">
                  {message}
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.85}
                  className="w-full py-3.5 rounded-2xl items-center mb-3"
                  style={{ backgroundColor: '#2DA9E9' }}
                >
                  <Text className="text-white font-bold text-base">Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRegister}
                  activeOpacity={0.85}
                  className="w-full py-3.5 rounded-2xl items-center mb-4 border border-gray-200"
                >
                  <Text className="text-gray-800 font-bold text-base">Create Account</Text>
                </TouchableOpacity>

                {/* Dismiss */}
                <TouchableOpacity onPress={onDismiss} activeOpacity={0.7}>
                  <Text className="text-gray-400 text-sm">Maybe later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
