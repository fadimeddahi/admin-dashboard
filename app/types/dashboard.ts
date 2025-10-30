export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
}

export interface RecentOrder {
  id: number | string;
  number?: string;
  full_name?: string;
  email?: string;
  total: number;
  confirmed?: boolean;
  created_at?: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  quantity: number;
  barcode: string;
}
