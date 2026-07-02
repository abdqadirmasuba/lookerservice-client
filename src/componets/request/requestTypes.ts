// ─── Shared types and pure helpers for the Provider Request screen ───────────

export interface ServiceListItem {
  label: string;
  amount?: number;
  currency?: string;
  image_urls?: string[];
}

export interface ProviderInfoService {
  provider_service_id: string;
  service_id: string;
  service_name: string;
  service_list: ServiceListItem[];
  service_icon_url: string;
}

export interface ProviderInfo {
  id: string;
  business_name: string;
  average_rating: number;
  total_reviews: number;
  availability_status: string;
  is_verified: boolean;
  service_delivery_type: string;
  services: ProviderInfoService[];
}

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

export function availabilityMeta(status: string) {
  if (status === 'available') return { label: 'Available', color: '#16A34A', bg: '#DCFCE7' };
  if (status === 'busy') return { label: 'Busy', color: '#D97706', bg: '#FEF3C7' };
  return { label: 'Unavailable', color: '#6B7280', bg: '#F3F4F6' };
}

export function formatRequestDate(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const BLUE = '#2DA9E9';
export const ORANGE = '#F57C1F';
export const VISIBLE_COUNT = 4;
