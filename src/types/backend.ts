export interface LoginLogItem {
  id: number;
  email: string;
  ip: string;
  user_agent: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  created_at: string;
}

export interface BookingOrderItem {
  id: number;
  customer_name: string;
  phone: string;
  pickup: string;
  drop: string;
  vehicle: string;
  trip_type: string;
  date?: string;
  time?: string;
  estimated_fare: number;
  offer_code?: string;
  offer_price?: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  source: 'Offer Slider' | 'Direct Booking' | 'Fare Widget';
  created_at: string;
  notes?: string;
}
