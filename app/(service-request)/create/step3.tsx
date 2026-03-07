import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import {
  setLocation,
  nextStep,
  previousStep,
} from '@/src/store/slices/serviceRequestFormSlice';
import * as ExpoLocation from 'expo-location';

export default function Step3Screen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const {
    requestType,
    providerName,
    latitude,
    longitude,
    address,
    city,
  } = useAppSelector((state) => state.serviceRequestForm);

  const [localAddress, setLocalAddress] = useState(address || '');
  const [localCity, setLocalCity] = useState(city || '');
  const [localLatitude, setLocalLatitude] = useState(latitude?.toString() || '');
  const [localLongitude, setLocalLongitude] = useState(longitude?.toString() || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location.'
        );
        setIsGettingLocation(false);
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      setLocalLatitude(location.coords.latitude.toString());
      setLocalLongitude(location.coords.longitude.toString());

      // Try to get address from coordinates
      const geocode = await ExpoLocation.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        const addressParts = [
          place.name,
          place.street,
          place.district,
        ].filter(Boolean);
        
        if (addressParts.length > 0 && !localAddress) {
          setLocalAddress(addressParts.join(', '));
        }
        
        if (place.city && !localCity) {
          setLocalCity(place.city);
        }
      }

      Alert.alert('Success', 'Location obtained successfully!');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleNext = () => {
    if (!localAddress.trim()) {
      Alert.alert('Address Required', 'Please enter your service location address.');
      return;
    }

    if (!localCity.trim()) {
      Alert.alert('City Required', 'Please enter your city.');
      return;
    }

    const lat = parseFloat(localLatitude);
    const lng = parseFloat(localLongitude);

    if (localLatitude && isNaN(lat)) {
      Alert.alert('Invalid Coordinates', 'Please enter a valid latitude.');
      return;
    }

    if (localLongitude && isNaN(lng)) {
      Alert.alert('Invalid Coordinates', 'Please enter a valid longitude.');
      return;
    }

    // Save to Redux
    dispatch(setLocation({
      latitude: localLatitude ? lat : 0, // Default to 0 if not provided
      longitude: localLongitude ? lng : 0,
      address: localAddress.trim(),
      city: localCity.trim(),
    }));
    
    dispatch(nextStep());
    router.push('/(service-request)/create/step4');
  };

  const handleBack = () => {
    // Save current values before going back
    if (localAddress.trim() && localCity.trim()) {
      dispatch(setLocation({
        latitude: localLatitude ? parseFloat(localLatitude) : latitude || 0,
        longitude: localLongitude ? parseFloat(localLongitude) : longitude || 0,
        address: localAddress.trim(),
        city: localCity.trim(),
      }));
    }
    
    dispatch(previousStep());
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0F172A]" edges={['top']}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-[#334155]">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-primary-600 dark:text-primary-300 text-3xl font-light">‹</Text>
          </TouchableOpacity>
          <View className="flex-1 mx-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white text-center">
              {requestType === 'direct' ? 'Request Service' : 'Post Open Request'}
            </Text>
            {providerName && requestType === 'direct' && (
              <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-0.5">
                from {providerName}
              </Text>
            )}
          </View>
          <View className="w-8" />
        </View>
        
        {/* Progress Bar */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-primary-500 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Step 3 of 4: Service Location
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Current Location Button */}
          <TouchableOpacity
            onPress={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-xl px-4 py-4 flex-row items-center justify-center mb-6"
            activeOpacity={0.7}
          >
            {isGettingLocation ? (
              <>
                <ActivityIndicator size="small" color="#2DA9E9" className="mr-2" />
                <Text className="text-primary-600 dark:text-primary-300 font-semibold text-base">
                  Getting Location...
                </Text>
              </>
            ) : (
              <>
                <Text className="text-2xl mr-2">📍</Text>
                <Text className="text-primary-600 dark:text-primary-300 font-semibold text-base">
                  Use Current Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Address */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Service Address <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Where do you need the service?
            </Text>
            <TextInput
              value={localAddress}
              onChangeText={setLocalAddress}
              placeholder="E.g., 123 Main Street, Apartment 4B"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            />
          </View>

          {/* City */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              City <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={localCity}
              onChangeText={setLocalCity}
              placeholder="E.g., Kampala"
              placeholderTextColor="#9CA3AF"
              className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
            />
          </View>

          {/* Coordinates (Optional) */}
          <View className="mb-5">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Coordinates (Optional)
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Automatically filled when using current location
            </Text>
            
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">Latitude</Text>
                <TextInput
                  value={localLatitude}
                  onChangeText={setLocalLatitude}
                  placeholder="0.0000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
                />
              </View>

              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">Longitude</Text>
                <TextInput
                  value={localLongitude}
                  onChangeText={setLocalLongitude}
                  placeholder="0.0000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base"
                />
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <View className="flex-row items-start">
              <Text className="text-xl mr-2">📍</Text>
              <Text className="flex-1 text-sm text-blue-900 dark:text-blue-200">
                Providing accurate location helps the provider reach you faster and provide better service.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary-500 py-4 rounded-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            Next: Review & Submit
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
