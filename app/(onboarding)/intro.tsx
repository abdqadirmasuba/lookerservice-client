import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { saveOnboardingComplete } from '../../src/utils/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to LookerService',
    description: 'Your trusted platform to connect with verified service providers',
    emoji: '👋',
  },
  {
    id: 2,
    title: 'Find Verified Providers',
    description: 'Browse through hundreds of verified and rated service providers in your area',
    emoji: '🔍',
  },
  {
    id: 3,
    title: 'Post Requests & Get Bids',
    description: 'Post your service request and receive competitive bids from providers',
    emoji: '💼',
  },
  {
    id: 4,
    title: 'Book, Pay & Rate',
    description: 'Book services, make secure payments, and rate your experience',
    emoji: '⭐',
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = async () => {
    await saveOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const handleGetStarted = async () => {
    await saveOnboardingComplete();
    router.replace('/(auth)/register');
  };

  const currentSlideData = slides[currentSlide];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-8xl mb-12">{currentSlideData.emoji}</Text>
        <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
          {currentSlideData.title}
        </Text>
        <Text className="text-base text-gray-600 text-center px-4">
          {currentSlideData.description}
        </Text>
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-12">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className="px-8 pb-12">
        {currentSlide < slides.length - 1 ? (
          <View className="flex-row justify-between">
            <TouchableOpacity onPress={handleSkip} className="py-4 px-8">
              <Text className="text-gray-600 font-medium">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              className="bg-primary-500 py-4 px-8 rounded-button"
            >
              <Text className="text-white font-semibold">Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleGetStarted}
            className="bg-primary-500 py-4 rounded-button items-center"
          >
            <Text className="text-white font-semibold text-lg">Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
