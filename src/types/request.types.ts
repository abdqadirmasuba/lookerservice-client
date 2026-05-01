export type RequestType = 'direct' | 'open';
export type RequestStatus = 'open' | 'responded' | 'rejected' | 'in_progress' | 'completed' | 'cancelled' | 'closed';

export interface ServiceRequestService {
  id: string;
  title: string;
  service_name: string;
  category_name?: string;
}

export interface ServiceRequest {
  id: string;
  request_number: string;
  client_id?: string;
  request_type: RequestType;
  description?: string;
  address?: string;
  city?: string;
  status: RequestStatus;
  budget_min?: number | null;
  budget_max?: number | null;
  preferred_date?: string | null;
  deadline?: string | null;
  images?: string[] | null;
  // List response fields
  service_names?: string[];
  business_name?: string;
  business_logo?: string | null;
  // Detail response fields
  services?: ServiceRequestService[];
  bid_count?: number;
  target_provider_id?: string;
  target_provider_name?: string;
  rejection_reason?: string | null;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at?: string;
}

export interface CreateRequestData {
  title: string;
  description: string;
  categoryId: string;
  budget: number;
  budgetType: 'fixed' | 'negotiable';
  location: {
    address: string;
    city: string;
    district: string;
    additionalDirections?: string;
  };
  urgency: 'asap' | 'scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
  photos?: string[];
}
