export type OrderStatus =
  | 'created'
  | 'payment_processing'
  | 'payment_failed'
  | 'logistics_assigning'
  | 'pending_logistics'
  | 'delivered';

export interface OrderItem {
  id:       string;
  name:     string;
  quantity: number;
  price:    number;
}

export interface Order {
  id:           string;
  customer:     string;
  restaurant:   string;
  items:        OrderItem[];
  total:        number;
  status:       OrderStatus;
  driver:       string | null;
  retry_events: string[];
  created_at:   string;
}
