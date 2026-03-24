export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export type BookingStatusString = 'pending' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingService {
  id: string;
  service_name: string;
  title: string;
}

export interface BookingPaymentMethod {
  payment_method: string;
  valid: boolean;
}

/** Shape returned by /client/bookings */
export interface Booking {
  id: string;
  booking_number: string;
  client_id: string;
  provider_id: string;
  service_request_id: string;
  status: BookingStatusString;
  booking_date: string;
  client_notes: string | null;
  agreed_amount: number | null;
  payment_method: BookingPaymentMethod;
  business_name: string;
  provider_name: string;
  provider_phone: string | null;
  services: BookingService[];
  created_at: string;
  updated_at: string;
}

export interface BookingTimeline {
  booked: string;
  confirmed?: string;
  inProgress?: string;
  completed?: string;
  cancelled?: string;
}

export interface CreateBookingData {
  providerId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    city: string;
    district: string;
    additionalDirections?: string;
  };
  specialInstructions?: string;
}

export interface ReviewData {
  rating: number;
  comment: string;
  categories?: {
    quality: number;
    timeliness: number;
    professionalism: number;
    value: number;
  };
  photos?: string[];
}
