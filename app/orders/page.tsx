"use client";

import { useState } from "react";
import { Search, Eye, CheckCircle, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import OrderDetailsModal from "../components/OrderDetailsModal";
import type { Order } from "../types/orders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";

// Order and OrderItem types are imported from `app/types/orders.ts`

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/all`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
      }
      return res.json();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/${id}/confirm`, { method: "PUT" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Confirm failed: ${res.status} ${text}`);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed: ${res.status} ${text}`);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const mappedOrders = (orders || []).map((o) => ({
    id: o.number || String(o.id),
    apiId: o.id, // use this when calling backend endpoints
    customer: o.full_name || o.email || "—",
    total: o.total || 0,
    status: o.confirmed ? "Completed" : "Pending",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "-",
    raw: o,
  })) as Array<{
    id: string;
    apiId: number | string;
    customer: string;
    total: number;
    status: "Pending" | "Completed" | "Cancelled";
    date: string;
    raw: Order;
  }>;

  const filteredOrders = mappedOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmOrder = async (displayedOrderId: string) => {
    if (!confirm("Confirm this order as completed?")) return;
    const entry = mappedOrders.find((m) => m.id === displayedOrderId);
    if (!entry) return alert("Order not found");
    try {
      await confirmMutation.mutateAsync(entry.apiId);
      // success handled by invalidate
    } catch (err) {
      alert((err as Error).message || "Failed to confirm order");
    }
  };

  const handleDeleteOrder = async (displayedOrderId: string) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    const entry = mappedOrders.find((m) => m.id === displayedOrderId);
    if (!entry) return alert("Order not found");
    try {
      await deleteMutation.mutateAsync(entry.apiId);
    } catch (err) {
      alert((err as Error).message || "Failed to delete order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "Cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
              <p className="text-gray-400">Manage and track customer orders</p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                />
              </div>
            </div>

            {isLoading && (
              <div className="text-gray-400 mb-4">Loading orders...</div>
            )}

            {/* Orders Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-white">{order.customer}</td>
                      <td className="px-6 py-4 text-white font-semibold">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{order.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                            title="View Details"
                            onClick={() => setSelectedOrder(order.raw)}
                          >
                            <Eye size={18} className="text-primary" />
                          </button>
                          {order.status === "Pending" && (
                            <>
                              <button 
                                onClick={() => handleConfirmOrder(order.id)}
                                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Confirm Order"
                              >
                                <CheckCircle size={18} className="text-green-400" />
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                title="Delete Order"
                              >
                                <Trash2 size={18} className="text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-white">{mappedOrders.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {mappedOrders.filter((o) => o.status === "Pending").length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  ${mappedOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onConfirm={() => { setSelectedOrder(null); }} />
      )}
    </ProtectedRoute>
  );
}


