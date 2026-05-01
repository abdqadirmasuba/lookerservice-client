import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../src/store/hooks';
import { updateUser, updateProfileImage } from '../../src/store/slices/userSlice';
import { getInitials, formatDate } from '../../src/utils/formatters';
import { apiRequests } from '../../src/utils/apiRequests';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      // TODO: call update profile endpoint
      // await apiRequests.put('/client/profile', { full_name: fullName.trim(), email, phone });
      dispatch(updateUser({ fullName: fullName.trim(), email, phone }));
      setSuccessMsg('Profile updated successfully');
      setIsEditing(false);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.fullName ?? '');
    setEmail(user?.email ?? '');
    setPhone(user?.phone ?? '');
    setError('');
    setIsEditing(false);
  };

  const handleAvatarPress = () => {
    Alert.alert('Profile Photo', 'How would you like to update your photo?', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) await uploadProfileImage(result.assets[0]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) await uploadProfileImage(result.assets[0]);
  };

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploadingImage(true);
    setError('');
    setSuccessMsg('');
    try {
      const ext = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const fileName = `photo.${ext}`;

      // Step 1: Get a presigned S3 upload URL
      const { data: presignRes } = await apiRequests.post('/uploads/presign', {
        upload_type: 'profile_picture',
        file_name: fileName,
        content_type: contentType,
      });
      const { upload_url, public_url } = presignRes.data;

      // Step 2: Upload image bytes directly to S3
      const blobRes = await fetch(asset.uri);
      const blob = await blobRes.blob();
      await apiRequests.uploadToS3(upload_url, blob, contentType);

      // Step 3: Save the public URL to the backend
      await apiRequests.patch('/client/profile/picture', { profile_picture_url: public_url });

      // Step 4: Update Redux state
      dispatch(updateProfileImage(public_url));
      setSuccessMsg('Profile photo updated');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update profile photo');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar Hero */}
        <View className="bg-primary-500 pt-8 pb-12 items-center">
          <TouchableOpacity
            onPress={isEditing ? handleAvatarPress : undefined}
            disabled={!isEditing || isUploadingImage}
            activeOpacity={isEditing ? 0.7 : 1}
            className="mb-3"
            style={{ position: 'relative' }}
          >
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-white/20 items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {getInitials(user?.fullName ?? 'U')}
                </Text>
              </View>
            )}
            {isEditing && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  borderRadius: 16,
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#F57C1F',
                }}
              >
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color="#F57C1F" />
                ) : (
                  <Text style={{ fontSize: 15 }}>📷</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">{user?.fullName}</Text>
          <Text className="text-white/70 text-sm mt-0.5">{user?.email ?? user?.phone}</Text>

          {/* Verification badges */}
          <View className="flex-row gap-2 mt-3">
            {user?.isEmailVerified && (
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">✅ Email verified</Text>
              </View>
            )}
            {user?.isPhoneVerified && (
              <View className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-medium">✅ Phone verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Card */}
        <View className="mx-4 -mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Alerts */}
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

          {/* Fields */}
          <Field
            label="Full Name"
            value={fullName}
            editing={isEditing}
            onChangeText={(t) => { setFullName(t); setError(''); setSuccessMsg(''); }}
            placeholder="Your full name"
          />
          <Field
            label="Email Address"
            value={email}
            editing={isEditing}
            onChangeText={setEmail}
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone Number"
            value={phone}
            editing={isEditing}
            onChangeText={setPhone}
            placeholder="+256 700 000 000"
            keyboardType="phone-pad"
          />
          <ReadOnlyField label="Role" value={user?.role ?? '—'} />
          <ReadOnlyField label="Status" value={user?.status ?? '—'} capitalize />
          <ReadOnlyField
            label="Member Since"
            value={user?.createdAt ? formatDate(user.createdAt) : '—'}
          />
        </View>

        {/* Action buttons */}
        <View className="mx-4 mt-4">
          {isEditing ? (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-4 rounded-xl border border-gray-300 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
                className="flex-1 py-4 rounded-xl bg-primary-500 items-center"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => { setSuccessMsg(''); setIsEditing(true); }}
              activeOpacity={0.8}
              className="py-4 rounded-xl bg-primary-500 items-center"
            >
              <Text className="text-white font-bold text-base">Edit Profile</Text>
            </TouchableOpacity>
          )}

          {/* Delete account shortcut */}
          {/* <TouchableOpacity
            onPress={() => router.push('/(account)/delete-account')}
            className="mt-3 py-4 rounded-xl border border-red-200 bg-red-50 items-center"
          >
            <Text className="text-red-600 font-semibold">Delete Account</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── helpers ────────────────────────────────────────────── */

function Field({
  label,
  value,
  editing,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  editing: boolean;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </Text>
      {editing ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50"
        />
      ) : (
        <Text className="text-base text-gray-800 py-1">{value || '—'}</Text>
      )}
    </View>
  );
}

function ReadOnlyField({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </Text>
      <Text className={`text-base text-gray-800 py-1 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </Text>
    </View>
  );
}

