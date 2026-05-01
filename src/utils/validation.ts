import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, NAME_MIN_LENGTH, NAME_MAX_LENGTH } from './constants';

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Phone validation — country code aware using libphonenumber-js
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const clean = phone.replace(/[\s\-\(\)]/g, '');

  const parsed = parsePhoneNumberFromString(clean);

  if (!parsed || !parsed.country) {
    return { isValid: false, error: 'Invalid or unrecognized country code' };
  }

  if (!parsed.isValid()) {
    return { isValid: false, error: `Invalid phone number for the entered country code (+${parsed.countryCallingCode})` };
  }

  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { isValid: false, error: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters` };
  }
  
  return { isValid: true };
};

// Password strength
export const validatePasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  suggestions: string[];
} => {
  const suggestions: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) suggestions.push('Add numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add special characters');
  if (password.length < 12) suggestions.push('Make it longer (12+ characters)');
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'medium';
  if (score >= 6) strength = 'strong';
  
  return { strength, suggestions };
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): { isValid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Min length validation
export const validateMinLength = (value: string, min: number, fieldName: string): { isValid: boolean; error?: string } => {
  if (value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  return { isValid: true };
};

// Max length validation
export const validateMaxLength = (value: string, max: number, fieldName: string): { isValid: boolean; error?: string } => {
  if (value.length > max) {
    return { isValid: false, error: `${fieldName} must not exceed ${max} characters` };
  }
  return { isValid: true };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.length < NAME_MIN_LENGTH) {
    return { isValid: false, error: `Name must be at least ${NAME_MIN_LENGTH} characters` };
  }
  
  if (name.length > NAME_MAX_LENGTH) {
    return { isValid: false, error: `Name must not exceed ${NAME_MAX_LENGTH} characters` };
  }
  
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};
