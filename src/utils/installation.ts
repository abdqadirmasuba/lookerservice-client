import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import * as Localization from 'expo-localization';
import * as Network from 'expo-network';
import { apiRequests } from './apiRequests';
import { getInstallationId, saveInstallationId } from './storage';
import { setInstallationId } from '../store/slices/installationSlice';
import { store } from '../store';

const INSTALLATION_ENDPOINT = '/installations';

const normalizeNetworkType = (type: string | undefined): string => {
  if (!type) return 'unknown';
  const normalized = type.toLowerCase();
  if (normalized.includes('wifi')) return 'wifi';
  if (normalized.includes('cell') || normalized.includes('mobile')) return 'cellular';
  return normalized;
};

const getCarrier = async (): Promise<string> => {
  try {
    const carrierFn = (Network as any).getCarrier ?? (Network as any).getCarrierAsync;
    if (typeof carrierFn === 'function') {
      const result = await carrierFn();
      if (typeof result === 'string' && result) {
        return result;
      }
      if (result?.carrier) {
        return result.carrier;
      }
    }
  } catch (error) {
    console.warn('Could not read carrier from expo-network', error);
  }
  return 'unknown';
};

const getBatteryLevel = async (): Promise<number> => {
  try {
    const batteryFn = (Device as any).getBatteryLevelAsync ?? (Device as any).batteryLevel;
    if (typeof batteryFn === 'function') {
      const level = await batteryFn();
      if (typeof level === 'number' && !Number.isNaN(level)) {
        return Math.min(Math.max(level, 0), 1);
      }
    }
  } catch (_error) {
    // Fall back if expo-device does not expose battery data.
  }
  return 0;
};

const getDevicePayload = async (appType: 'client' | 'provider' = 'client') => {
  const appVersion = Application.nativeApplicationVersion ?? '1.0.0';
  const buildNumber = Application.nativeBuildVersion ?? '1';
  const platform = Platform.OS === 'android' ? 'android' : Platform.OS === 'ios' ? 'ios' : Platform.OS;
  const deviceModel = (Device.modelName ?? `${Device.manufacturer ?? ''} ${Device.brand ?? ''}`.trim()) || 'Unknown Device';
  const deviceName = (Device as any).deviceName ?? deviceModel;
  const osVersion = [Device.osName, Device.osVersion].filter(Boolean).join(' ') || 'Unknown OS';
  const networkState = await Network.getNetworkStateAsync();
  const networkType = normalizeNetworkType(networkState.type);
  const carrier = await getCarrier();
  const batteryLevel = await getBatteryLevel();

  const locale = Localization.getLocales()[0]?.languageTag ?? 'en-US';
  const timeZone = Localization.getCalendars()[0]?.timeZone ?? 'UTC';
  const country = locale.includes('-') ? locale.split('-')[1] : Localization.getLocales()[0]?.regionCode ?? 'US';

  return {
    app_type: appType,
    app_version: appVersion,
    build_number: buildNumber,
    platform,
    device_model: deviceModel,
    device_name: deviceName,
    os_version: osVersion,
    locale,
    time_zone: timeZone,
    country,
    city: '',
    network_type: networkType,
    carrier,
    device_info: {
      battery_level: batteryLevel,
    },
  };
};

export async function ensureInstallationRegistered(appType: 'client' | 'provider' = 'client'): Promise<string> {
  const existingId = await getInstallationId();
  if (existingId) {
    store.dispatch(setInstallationId(existingId));
    return existingId;
  }

  const payload = await getDevicePayload(appType);
  const response = await apiRequests.post(INSTALLATION_ENDPOINT, payload);
  const installationId = response?.data?.data?.installation_id;

  if (!installationId || typeof installationId !== 'string') {
    throw new Error('Installation registration failed to return an installation_id');
  }

  await saveInstallationId(installationId);
  store.dispatch(setInstallationId(installationId));
  return installationId;
}

export async function registerDevicePushToken(pushToken: string, appType: 'client' | 'provider' = 'client'): Promise<void> {
  const installationId = await ensureInstallationRegistered(appType);
  await apiRequests.patch(`${INSTALLATION_ENDPOINT}/${installationId}/push-tokens`, {
    push_token: pushToken,
    app_type: appType,
  });
}

export async function sendInstallationHeartbeat(appType: 'client' | 'provider' = 'client'): Promise<void> {
  const installationId = await ensureInstallationRegistered(appType);
  const deviceInfo = await getDevicePayload(appType);
  await apiRequests.patch(`${INSTALLATION_ENDPOINT}/${installationId}/heartbeat`, {
    app_version: deviceInfo.app_version,
    build_number: deviceInfo.build_number,
    device_info: {
      battery_level: deviceInfo.device_info.battery_level,
    },
  });
}
