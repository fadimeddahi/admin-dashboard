"use client";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";
import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import LowStockAlerts from "../components/LowStockAlerts";
import type { Order } from "../types/orders";
import type { Product } from "../types/products";
import type { RecentOrder, LowStockProduct } from "../types/dashboard";

interface StatsData {
  success: boolean;
  data: {
    total_revenue: number;
    total_orders: number;
    total_products: number;
    total_customers: number;
  };
}

export default function DashboardPage() {
  // Fetch dashboard stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      console.log('📊 Fetching dashboard stats from:', `${API_BASE_URL}/stats`);
      const res = await authenticatedFetch(`${API_BASE_URL}/stats`);
      const text = await res.text();
      console.log('📊 Stats response:', { status: res.status, text });
      if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status} ${text}`);
      const data = JSON.parse(text);
      console.log('📊 Parsed stats data:', data);
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  const stats = statsData?.data;
  
  if (statsError) {
    console.error('❌ Stats error:', statsError);
  }

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/all`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  // Fetch products for low stock alerts
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/products/all`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const totalRevenue = stats?.total_revenue || 0;
  const totalOrders = stats?.total_orders || 0;
  const totalProducts = stats?.total_products || 0;
  const totalCustomers = stats?.total_customers || 0;

  // Recent orders (last 5)
  const recentOrders: RecentOrder[] = [...orders]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Low stock products (quantity < 10)
  const lowStockProducts: LowStockProduct[] = products
    .filter((p) => p.quantity < 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      barcode: p.barcode,
    }))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your business metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          name="Total Revenue"
          value={`${(totalRevenue / 100).toFixed(2)} DA`}
          icon={DollarSign}
          color="bg-green-500"
          isLoading={statsLoading}
        />
        <StatCard
          name="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="bg-blue-500"
          isLoading={statsLoading}
        />
        <StatCard
          name="Total Customers"
          value={totalCustomers}
          icon={Users}
          color="bg-purple-500"
          isLoading={statsLoading}
        />
        <StatCard
          name="Total Products"
          value={totalProducts}
          icon={Package}
          color="bg-indigo-500"
          isLoading={statsLoading}
        />
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} isLoading={ordersLoading} />
        <LowStockAlerts products={lowStockProducts} isLoading={productsLoading} />
      </div>
    </div>
  );
}
