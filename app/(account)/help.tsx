import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SUPPORT_PHONE = '+256771210855';
const SUPPORT_WHATSAPP = '+256771210855';

const FAQS = [
  {
    id: '1',
    question: 'How do I make a service request?',
    answer:
      'Go to the Requests tab and tap "+ New Request". Describe the service you need, add your location, and submit. Providers nearby will bid on your request — you pick the best one!',
  },
  {
    id: '2',
    question: 'How do I book a provider directly?',
    answer:
      "Head to Explore and search for the service you need. Open a provider's profile, tap \"Book Now\", select a date and time, then confirm. You'll get a booking confirmation right away.",
  },
  {
    id: '3',
    question: 'How do payments work?',
    answer:
      'Payments are processed securely in the app after the service is completed. We support Mobile Money (MTN & Airtel) and card payments.',
  },
  {
    id: '4',
    question: 'How do I cancel a booking?',
    answer:
      "Go to Bookings, open the booking you want to cancel, and tap \"Cancel Booking\". Cancellation policies vary by provider, so check the provider's terms before cancelling.",
  },
  {
    id: '5',
    question: "What if a provider doesn't show up?",
    answer:
      "Contact our support team immediately via WhatsApp or phone below. We take no-shows very seriously and will help resolve the situation for you.",
  },
  {
    id: '6',
    question: 'How do I track my request status?',
    answer:
      'Open the Requests tab to see all your active requests. Tap any request to view real-time status updates and any bids from providers.',
  },
  {
    id: '7',
    question: 'How do I report a problem with a provider?',
    answer:
      "After a booking is complete, you can leave a review. For urgent issues, please contact our support team directly via WhatsApp or phone — we're here to help.",
  },
];

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  text: string;
}

export default function HelpScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      type: 'bot',
      text: "👋 Hi there! I'm the LookerService support assistant. Tap a question below to get an instant answer, or reach our team directly at the bottom.",
    },
  ]);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);

  const handleQuestion = (faq: (typeof FAQS)[0]) => {
    if (answeredIds.includes(faq.id)) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${faq.id}`, type: 'user', text: faq.question },
      { id: `b-${faq.id}`, type: 'bot', text: faq.answer },
    ]);
    setAnsweredIds((prev) => [...prev, faq.id]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const openWhatsApp = () => {
    const number = SUPPORT_WHATSAPP.replace(/\D/g, '');
    Linking.openURL(
      `https://wa.me/${number}?text=Hi%2C%20I%20need%20support%20with%20the%20LookerService%20app.`
    ).catch(() => {});
  };

  const openPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => {});
  };

  const unanswered = FAQS.filter((f) => !answeredIds.includes(f.id));

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Chat messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 16 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-3 max-w-[85%] ${msg.type === 'user' ? 'self-end' : 'self-start'}`}
          >
            {msg.type === 'bot' && (
              <View className="flex-row items-center mb-1">
                <View
                  className="w-6 h-6 rounded-full items-center justify-center mr-1.5"
                  style={{ backgroundColor: '#2DA9E9' }}
                >
                  <Ionicons name="chatbubble-ellipses" size={12} color="#fff" />
                </View>
                <Text className="text-xs text-gray-400 font-medium">Support Bot</Text>
              </View>
            )}
            <View
              className={`rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'rounded-tr-sm'
                  : 'bg-white rounded-tl-sm shadow-sm border border-gray-100'
              }`}
              style={msg.type === 'user' ? { backgroundColor: '#2DA9E9' } : undefined}
            >
              <Text
                className={`text-sm leading-5 ${
                  msg.type === 'user' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {/* FAQ quick-reply chips */}
        {unanswered.length > 0 && (
          <View className="self-start mt-2 mb-3">
            <Text className="text-xs text-gray-400 mb-2 ml-1">
              Tap a question to get an answer:
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {unanswered.map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  onPress={() => handleQuestion(faq)}
                  activeOpacity={0.75}
                  className="bg-white border rounded-full px-4 py-2 shadow-sm"
                  style={{ borderColor: '#2DA9E9' }}
                >
                  <Text className="text-xs font-medium" style={{ color: '#2DA9E9' }}>
                    {faq.question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Contact footer */}
      <View className="px-4 pb-6 pt-3 bg-white border-t border-gray-100">
        <Text className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">
          Still need help? Contact us directly
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={openWhatsApp}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl gap-2"
            style={{ backgroundColor: '#25D366' }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            <Text className="text-white font-bold text-sm">WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openPhone}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center py-3.5 rounded-xl gap-2 bg-gray-800"
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text className="text-white font-bold text-sm">Call Us</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
