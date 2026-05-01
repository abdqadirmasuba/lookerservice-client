import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { saveOnboardingComplete } from '../../src/utils/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Find Trusted Providers',
    description: 'Connect instantly with verified, top-rated service professionals in your area — so you never have to settle for less.',
    emoji: '🔍',
  },
  {
    id: 2,
    title: 'Post a Request & Get Bids',
    description: 'Describe what you need, sit back, and let skilled providers compete for your job with competitive offers.',
    emoji: '📋',
  },
  {
    id: 3,
    title: 'Book, Pay & Stay Protected',
    description: 'Secure bookings, safe payments, and a transparent rating system — your satisfaction is always guaranteed.',
    emoji: '🛡️',
  },
];

const AUTO_SCROLL_INTERVAL = 3500;

export default function IntroScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = () => {
    autoScrollRef.current = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % slides.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, []);

  const handleGetStarted = async () => {
    await saveOnboardingComplete();
    router.replace('/(auth)/register');
  };

  const onScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / width);
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const onScrollBeginDrag = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  };

  const onScrollEndDrag = () => {
    startAutoScroll();
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={{ width }} className="flex-1 items-center justify-center px-8">
        <Text className="text-8xl mb-10">{item.emoji}</Text>
        <Text className="text-3xl font-bold text-center mb-5 px-2" style={{ color: '#1565C0' }}>
          {item.title}
        </Text>
        <Text className="text-base text-center px-4 leading-relaxed" style={{ color: '#555' }}>
          {item.description}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

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
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Pagination Dots */}
      <View className="flex-row justify-center mb-8">
        {slides.map((_, index) => {
          const dotAnimatedStyle = useAnimatedStyle(() => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = interpolate(
              scrollX.value,
              inputRange,
              [8, 28, 8],
              Extrapolate.CLAMP
            );
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.4, 1, 0.4],
              Extrapolate.CLAMP
            );
            return { width: dotWidth, opacity };
          });

          return (
            <Animated.View
              key={index}
              style={dotAnimatedStyle}
              className="h-2 rounded-full mx-1 bg-gray-400"
            />
          );
        })}
      </View>

      {/* Get Started Button */}
      <View className="px-6 pb-12 items-center">
        <TouchableOpacity
          onPress={handleGetStarted}
          className="py-3 px-10 rounded-full"
          style={{ backgroundColor: '#2DA9E9' }}
        >
          <Text className="font-bold text-base text-white">
            Get Started
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            await saveOnboardingComplete();
            router.replace('/(auth)/login');
          }}
          className="mt-5 py-2"
        >
          <Text className="text-base" style={{ color: '#444' }}>
            Already have an account?{' '}
            <Text className="font-bold" style={{ color: '#F57C1F' }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
