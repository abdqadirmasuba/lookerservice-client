import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
} from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  enableScrollView?: boolean;
  showsVerticalScrollIndicator?: boolean;
}

export default function KeyboardAvoidingWrapper({
  children,
  style,
  enableScrollView = true,
  showsVerticalScrollIndicator = false,
}: KeyboardAvoidingWrapperProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, style]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {enableScrollView ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          <>{children}</>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}