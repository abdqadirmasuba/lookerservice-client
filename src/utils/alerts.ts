import { Alert } from 'react-native';

// Success alert
export const showSuccessAlert = (title: string, message: string, onOk?: () => void) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onOk,
    },
  ]);
};

// Error alert
export const showErrorAlert = (title: string, message: string, onOk?: () => void) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onOk,
      style: 'cancel',
    },
  ]);
};

// Warning alert
export const showWarningAlert = (title: string, message: string, onOk?: () => void) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onOk,
    },
  ]);
};

// Info alert
export const showInfoAlert = (title: string, message: string, onOk?: () => void) => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onOk,
    },
  ]);
};

// Validation error alert
export const showValidationError = (message: string) => {
  showErrorAlert('Validation Error', message);
};

// Required field alert
export const showRequiredFieldAlert = (fieldName: string) => {
  showValidationError(`${fieldName} is required`);
};

// Confirm alert
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: 'Confirm',
      onPress: onConfirm,
    },
  ]);
};

// Delete confirmation
export const showDeleteConfirm = (itemName: string, onConfirm: () => void) => {
  showConfirmAlert(
    'Delete Confirmation',
    `Are you sure you want to delete this ${itemName}? This action cannot be undone.`,
    onConfirm
  );
};

// Logout confirmation
export const showLogoutConfirm = (onConfirm: () => void) => {
  showConfirmAlert(
    'Logout',
    'Are you sure you want to logout?',
    onConfirm
  );
};

// Network error
export const showNetworkError = () => {
  showErrorAlert(
    'Network Error',
    'Please check your internet connection and try again.'
  );
};

// Session expired
export const showSessionExpired = (onOk: () => void) => {
  showErrorAlert(
    'Session Expired',
    'Your session has expired. Please login again.',
    onOk
  );
};

// Generic error
export const showGenericError = (error?: string) => {
  showErrorAlert(
    'Error',
    error || 'Something went wrong. Please try again later.'
  );
};
