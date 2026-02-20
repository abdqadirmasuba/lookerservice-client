export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Bid {
  id: string;
  requestId: string;
  providerId: string;
  provider: {
    id: string;
    businessName: string;
    profileImage?: string;
    rating: number;
    reviewsCount: number;
  };
  amount: number;
  message: string;
  estimatedDuration?: number;
  status: BidStatus;
  createdAt: string;
  expiresAt?: string;
}
