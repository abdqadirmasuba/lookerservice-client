import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// Used as the initial off-screen offset for the slide animation
const SLIDE_OFFSET = Math.round(SCREEN_HEIGHT * 0.4);

interface AuthRequiredModalProps {
  visible: boolean;
  /** Called when the user taps the backdrop, back arrow, or hardware back.
   *  Typically navigate back or replace to home tab. */
  onBack: () => void;
  message?: string;
}

export default function AuthRequiredModal({
  visible,
  onBack,
  message = 'Sign in to access this feature.',
}: AuthRequiredModalProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(SLIDE_OFFSET)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 190,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SLIDE_OFFSET,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onBack}
    >
      <View style={styles.container}>
        {/* Dimmed backdrop — tap to go back */}
        <TouchableWithoutFeedback onPress={onBack}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Bottom sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Back row */}
          <TouchableOpacity
            onPress={onBack}
            style={styles.backRow}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          {/* Hint message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action buttons side by side */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={handleLogin} style={styles.loginBtn} activeOpacity={0.85}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleRegister} style={styles.registerBtn} activeOpacity={0.85}>
              <Text style={styles.registerText}>Register</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 18,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: '#2DA9E9',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  registerBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  registerText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 15,
  },
});
