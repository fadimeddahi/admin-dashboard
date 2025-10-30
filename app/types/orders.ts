export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number | string;
  number?: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  willaya?: string;
  commune?: string;
  confirmed?: boolean;
  order_items?: OrderItem[];
  total: number;
  created_at?: string;
  shipping_price?: number;
  notes?: string;
  test_field?: string;
}
