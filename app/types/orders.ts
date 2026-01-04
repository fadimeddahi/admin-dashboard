export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  order_count?: number;
  total_spent?: number;
}

export interface Order {
  id: string;
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
  customer?: Customer;
}

export interface CompanyOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  company_order_id: string;
}

export interface CompanyOrder {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  person_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  website: string;
  tax_id: string;
  registration_number: string;
  contact_person: string;
  contact_title: string;
  industry: string;
  nif: string;
  rc: string;
  art: string;
  nic: string;
  confirmed: boolean;
  order_items: CompanyOrderItem[];
}
