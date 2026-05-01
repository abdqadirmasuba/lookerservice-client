import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequests } from '../../src/utils/apiRequests';

const CATEGORIES = [
  'Account Issues',
  'Booking Problem',
  'Provider Complaint',
  'Payment Issue',
  'App Bug / Technical',
  'Other',
];

export default function HelpScreen() {
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!contact.trim()) { setError('Please enter a contact email or phone number.'); return; }
    if (!category) { setError('Please select a category.'); return; }
    if (!description.trim()) { setError('Please describe your issue.'); return; }

    setError('');
    setIsSubmitting(true);
    try {
      await apiRequests.post('/support/tickets', {
        contact: contact.trim(),
        description: description.trim(),
        category,
      });
      setSuccessMsg('Your message has been sent. Our team will get back to you shortly.');
      setContact('');
      setDescription('');
      setCategory('');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-gray-500 text-sm mb-6">
          Fill in the form below and our support team will respond to your inquiry.
        </Text>

        {successMsg ? (
          <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-green-700 text-sm text-center font-medium">{successMsg}</Text>
          </View>
        ) : null}

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-red-700 text-sm text-center font-medium">{error}</Text>
          </View>
        ) : null}

        {/* Contact */}
        <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
          Contact (Email or Phone)
        </Text>
        <TextInput
          value={contact}
          onChangeText={(t) => { setContact(t); setError(''); setSuccessMsg(''); }}
          placeholder="your@email.com or +256 700 000 000"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white mb-5"
        />

        {/* Category */}
        <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
          Category
        </Text>
        <TouchableOpacity
          onPress={() => setCategoryOpen(true)}
          activeOpacity={0.7}
          className="border border-gray-200 rounded-xl px-4 py-3 bg-white mb-5 flex-row items-center justify-between"
        >
          <Text className={category ? 'text-gray-900' : 'text-gray-400'}>
            {category || 'Select a category'}
          </Text>
          <Text className="text-gray-400 text-base">▾</Text>
        </TouchableOpacity>

        {/* Description */}
        <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
          Description
        </Text>
        <TextInput
          value={description}
          onChangeText={(t) => { setDescription(t); setError(''); setSuccessMsg(''); }}
          placeholder="Describe your issue or inquiry in detail…"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white mb-6"
          style={{ minHeight: 120 }}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
          className="bg-primary-500 py-4 rounded-xl items-center"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Category picker modal */}
      <Modal visible={categoryOpen} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setCategoryOpen(false)}
        >
          <View className="bg-white rounded-t-3xl p-5">
            <Text className="text-base font-semibold text-gray-800 mb-4">Select Category</Text>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => { setCategory(cat); setCategoryOpen(false); setError(''); }}
                activeOpacity={0.7}
                className={`py-3 px-4 rounded-xl mb-2 ${
                  category === cat ? 'bg-primary-50 border border-primary-300' : 'bg-gray-50'
                }`}
              >
                <Text
                  className={`text-base ${
                    category === cat ? 'text-primary-600 font-semibold' : 'text-gray-800'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setCategoryOpen(false)}
              className="mt-2 py-3 items-center"
            >
              <Text className="text-gray-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
