export enum RequestStatus {
  AWAITING_BIDS = 'awaiting_bids',
  BIDS_RECEIVED = 'bids_received',
  ACCEPTED = 'accepted',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export interface ServiceRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
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
  status: RequestStatus;
  bidsCount: number;
  createdAt: string;
  updatedAt?: string;
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
