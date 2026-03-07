import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  // Platform, // Commented out - not used after disabling date pickers
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import {
  setDescription,
  setBudget,
  // setPreferredDate,
  // setDeadline,
  nextStep,
  previousStep,
} from '@/src/store/slices/serviceRequestFormSlice';
// import DateTimePicker from '@react-native-community/datetimepicker';

export default function Step2Screen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const {
    requestType,
    providerName,
    description,
    budgetMin,
    budgetMax,
    // preferredDate,
    // deadline,
  } = useAppSelector((state) => state.serviceRequestForm);

  const [localDescription, setLocalDescription] = useState(description || '');
  const [localBudgetMin, setLocalBudgetMin] = useState(budgetMin?.toString() || '');
  const [localBudgetMax, setLocalBudgetMax] = useState(budgetMax?.toString() || '');
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  // const [tempDate, setTempDate] = useState(
  //   preferredDate ? new Date(preferredDate) : new Date()
  // );
  // const [tempDeadline, setTempDeadline] = useState(
  //   deadline ? new Date(deadline) : new Date()
  // );

  const handleNext = () => {
    if (!localDescription.trim()) {
      Alert.alert('Description Required', 'Please describe what you need done.');
      return;
    }

    if (localDescription.trim().length < 20) {
      Alert.alert('Description Too Short', 'Please provide at least 20 characters describing your needs.');
      return;
    }

    const minBudget = parseFloat(localBudgetMin);
    const maxBudget = parseFloat(localBudgetMax);

    if (localBudgetMin && isNaN(minBudget)) {
      Alert.alert('Invalid Budget', 'Please enter a valid minimum budget.');
      return;
    }

    if (localBudgetMax && isNaN(maxBudget)) {
      Alert.alert('Invalid Budget', 'Please enter a valid maximum budget.');
      return;
    }

    if (localBudgetMin && localBudgetMax && minBudget > maxBudget) {
      Alert.alert('Invalid Budget', 'Minimum budget cannot be greater than maximum budget.');
      return;
    }

    // Save to Redux
    dispatch(setDescription(localDescription.trim()));
    dispatch(setBudget({
      min: localBudgetMin ? minBudget : null,
      max: localBudgetMax ? maxBudget : null,
    }));
    
    dispatch(nextStep());
    router.push('/(service-request)/create/step3');
  };

  const handleBack = () => {
    // Save current values before going back
    dispatch(setDescription(localDescription.trim()));
    dispatch(setBudget({
      min: localBudgetMin ? parseFloat(localBudgetMin) : null,
      max: localBudgetMax ? parseFloat(localBudgetMax) : null,
    }));
    
    dispatch(previousStep());
    router.back();
  };

  // const handleDateChange = (event: any, selectedDate?: Date) => {
  //   if (Platform.OS === 'android') {
  //     setShowDatePicker(false);
  //   }
  //   
  //   if (selectedDate) {
  //     setTempDate(selectedDate);
  //     dispatch(setPreferredDate(selectedDate.toISOString()));
  //   }
  // };

  // const handleDeadlineChange = (event: any, selectedDate?: Date) => {
  //   if (Platform.OS === 'android') {
  //     setShowDeadlinePicker(false);
  //   }
  //   
  //   if (selectedDate) {
  //     setTempDeadline(selectedDate);
  //     dispatch(setDeadline(selectedDate.toISOString()));
  //   }
  // };

  // const formatDate = (dateString: string | null) => {
  //   if (!dateString) return 'Select date';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', {
  //     weekday: 'short',
  //     year: 'numeric',
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });
  // };

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
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <View className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          Step 2 of 4: Budget & Schedule
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Describe Your Need <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Provide detailed information (minimum 20 characters)
            </Text>
            <TextInput
              value={localDescription}
              onChangeText={setLocalDescription}
              placeholder="E.g., I have a leaking kitchen sink that needs urgent repair..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-base min-h-[120px]"
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {localDescription.length}/20 minimum
            </Text>
          </View>

          {/* Budget Range */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Budget Range (Optional)
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Set your budget expectations in UGX
            </Text>
            
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">Minimum</Text>
                <View className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 flex-row items-center">
                  <Text className="text-gray-500 dark:text-gray-400 mr-2">UGX</Text>
                  <TextInput
                    value={localBudgetMin}
                    onChangeText={setLocalBudgetMin}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-gray-900 dark:text-white text-base"
                  />
                </View>
              </View>

              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">Maximum</Text>
                <View className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-3 flex-row items-center">
                  <Text className="text-gray-500 dark:text-gray-400 mr-2">UGX</Text>
                  <TextInput
                    value={localBudgetMax}
                    onChangeText={setLocalBudgetMax}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-gray-900 dark:text-white text-base"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Preferred Date - TEMPORARILY DISABLED DUE TO ANDROID DATEPICKER ISSUES */}
          {/* <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Preferred Date & Time (Optional)
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              When would you like the service to be done?
            </Text>
            
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">📅</Text>
                <Text className={`text-base ${
                  preferredDate
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatDate(preferredDate)}
                </Text>
              </View>
              {preferredDate && (
                <TouchableOpacity onPress={() => dispatch(setPreferredDate(null))}>
                  <Text className="text-red-500 text-sm font-semibold">Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View> */}

          {/* Deadline - TEMPORARILY DISABLED DUE TO ANDROID DATEPICKER ISSUES */}
          {/* {/* <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              Deadline (Optional)
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              When must the service be completed by?
            </Text>
            
            <TouchableOpacity
              onPress={() => setShowDeadlinePicker(true)}
              className="bg-white dark:bg-[#1E293B] border border-gray-300 dark:border-[#334155] rounded-xl px-4 py-4 flex-row items-center justify-between"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Text className="text-2xl mr-3">⏰</Text>
                <Text className={`text-base ${
                  deadline
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {formatDate(deadline)}
                </Text>
              </View>
              {deadline && (
                <TouchableOpacity onPress={() => dispatch(setDeadline(null))}>
                  <Text className="text-red-500 text-sm font-semibold">Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>  */}

          {/* Info Card */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
            <View className="flex-row items-start">
              <Text className="text-xl mr-2">💡</Text>
              <Text className="flex-1 text-sm text-blue-900 dark:text-blue-200">
                Providing detailed information helps providers give you better quotes and faster responses.
              </Text>
            </View>
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Date Pickers - TEMPORARILY DISABLED DUE TO ANDROID DATEPICKER ISSUES */}
      {/* {/* {showDatePicker && (
      //   <DateTimePicker
      //     value={tempDate}
      //     mode="datetime"
      //     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      //     onChange={handleDateChange}
      //     minimumDate={new Date()}
      //   />
      // )}
      
      // {showDeadlinePicker && (
      //   <DateTimePicker
      //     value={tempDeadline}
      //     mode="datetime"
      //     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      //     onChange={handleDeadlineChange}
      //     minimumDate={new Date()}
      //   />
      // )} */}

      {/* Fixed Bottom Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-[#334155] px-5 py-4">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary-500 py-4 rounded-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">
            Next: Add Location
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

