export interface DashboardActiveRequest {
  id: string;
  request_number: string;
  title: string;
  request_type: 'direct' | 'open';
  status: string;
  created_at: string;
  bid_count: number;
  target_provider_name?: string;
}

export interface DashboardActiveBooking {
  id: string;
  booking_number: string;
  service_title: string;
  status: string;
  scheduled_date: string;
  provider_name: string;
}

export interface DashboardSummary {
  active_requests_count: number;
  active_bookings_count: number;
  unread_notifications_count: number;
  active_requests: DashboardActiveRequest[];
  active_bookings: DashboardActiveBooking[];
}

export interface DashboardApiResponse {
  success: boolean;
  message: string;
  data: DashboardSummary;
}
