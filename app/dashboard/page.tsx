"use client";

import { DollarSign, ShoppingCart, Package, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";
import StatCard from "../components/StatCard";
import RecentOrders from "../components/RecentOrders";
import LowStockAlerts from "../components/LowStockAlerts";
import type { Order } from "../types/orders";
import type { Product } from "../types/products";
import type { RecentOrder, LowStockProduct } from "../types/dashboard";

export default function DashboardPage() {
  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/all`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => !o.confirmed).length;
  const totalProducts = products.length;

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

  const isLoading = ordersLoading || productsLoading;

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
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
          isLoading={isLoading}
        />
        <StatCard
          name="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          color="bg-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          name="Pending Orders"
          value={pendingOrders}
          icon={Clock}
          color="bg-yellow-500"
          isLoading={isLoading}
        />
        <StatCard
          name="Total Products"
          value={totalProducts}
          icon={Package}
          color="bg-purple-500"
          isLoading={isLoading}
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
