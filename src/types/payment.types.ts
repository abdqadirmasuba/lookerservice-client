export enum PaymentMethodType {
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  details: {
    // For Mobile Money
    provider?: 'MTN' | 'Airtel';
    phoneNumber?: string;
    // For Card
    cardLast4?: string;
    cardBrand?: 'Visa' | 'Mastercard';
    expiryMonth?: string;
    expiryYear?: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  paymentMethodId: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
}
