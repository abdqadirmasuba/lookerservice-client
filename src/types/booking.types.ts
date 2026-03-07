export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Booking {
  id: string;
  userId: string;
  providerId: string;
  provider: {
    id: string;
    businessName: string;
    profileImage?: string;
    rating: number;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    city: string;
    district: string;
    additionalDirections?: string;
  };
  specialInstructions?: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  status: BookingStatus;
  timeline?: BookingTimeline;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  requestId?: string;
  bidId?: string;
  createdAt: string;
  updatedAt?: string;
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
