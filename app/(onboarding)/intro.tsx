import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { saveOnboardingComplete } from '../../src/utils/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to LookerService',
    description: 'Your trusted platform to connect with verified service providers near you',
    emoji: '👋',
    gradient: ['#F57C1F', '#E06A0F'] as const,
  },
  {
    id: 2,
    title: 'Find Verified Providers',
    description: 'Browse through hundreds of verified and highly-rated service providers in your area',
    emoji: '🔍',
    gradient: ['#3B82F6', '#2563EB'] as const,
  },
  {
    id: 3,
    title: 'Post Requests & Get Bids',
    description: 'Post your service request and receive competitive bids from multiple providers',
    emoji: '💼',
    gradient: ['#10B981', '#059669'] as const,
  },
  {
    id: 4,
    title: 'Book, Pay & Rate',
    description: 'Book services securely, make payments, and rate your experience with providers',
    emoji: '⭐',
    gradient: ['#8B5CF6', '#7C3AED'] as const,
  },
];

export default function IntroScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
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

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    setCurrentSlide(index);
  };

  const renderSlide = ({ item, index }: { item: typeof slides[0]; index: number }) => {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-8">
        <Text className="text-8xl mb-12">{item.emoji}</Text>
        <Text className="text-3xl font-bold text-white text-center mb-4 px-4">
          {item.title}
        </Text>
        <Text className="text-lg text-white/90 text-center px-4 leading-relaxed">
          {item.description}
        </Text>
      </View>
    );
  };

  const currentSlideData = slides[currentSlide];

  return (
    <LinearGradient
      colors={currentSlideData.gradient}
      className="flex-1"
    >
      <StatusBar style="light" />

      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <View className="absolute top-12 right-6 z-10">
          <TouchableOpacity 
            onPress={handleSkip} 
            className="px-6 py-3 bg-white/20 rounded-full backdrop-blur-lg"
          >
            <Text className="text-white font-semibold text-base">Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => {
          const dotAnimatedStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const widthValue = interpolate(
              scrollX.value,
              inputRange,
              [8, 32, 8],
              Extrapolate.CLAMP
            );
            const opacityValue = interpolate(
              scrollX.value,
              inputRange,
              [0.4, 1, 0.4],
              Extrapolate.CLAMP
            );
            return {
              width: widthValue,
              opacity: opacityValue,
            };
          });

          return (
            <Animated.View
              key={index}
              style={dotAnimatedStyle}
              className="h-2 rounded-full mx-1 bg-white"
            />
          );
        })}
      </View>

      {/* Navigation Buttons */}
      <View className="px-6 pb-12">
        {currentSlide < slides.length - 1 ? (
          <View className="flex-row justify-between items-center">
            <View style={{ width: 80 }} />
            <TouchableOpacity
              onPress={handleNext}
              className="bg-white py-4 px-12 rounded-full shadow-lg"
            >
              <Text className="text-primary-500 font-bold text-lg">Next</Text>
            </TouchableOpacity>
            <View style={{ width: 80 }} />
          </View>
        ) : (
          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleGetStarted}
              className="bg-white py-5 rounded-full items-center shadow-lg"
            >
              <Text className="text-primary-500 font-bold text-lg">Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSkip}
              className="py-4 items-center"
            >
              <Text className="text-white/90 font-medium text-base">I already have an account</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}
