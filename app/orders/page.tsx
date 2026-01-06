"use client";

import { useState } from "react";
import { Search, Eye, CheckCircle, Trash2, Building2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import OrderDetailsModal from "../components/OrderDetailsModal";
import CompanyOrderModal from "../components/CompanyOrderModal";
import type { Order, CompanyOrder } from "../types/orders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCompanyOrder, setSelectedCompanyOrder] = useState<CompanyOrder | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      console.log('🔄 Fetching orders from API...', new Date().toLocaleTimeString());
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/all`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch orders: ${res.status} ${text}`);
      }
      const data = await res.json();
      console.log(`✅ Orders fetched: ${data.length} orders`, data);
      return data;
    },
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Only fetch once on mount
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: companyOrders = [], isLoading: isLoadingCompanyOrders } = useQuery<CompanyOrder[]>({
    queryKey: ["company-orders"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/company-orders`);
      if (!res.ok) {
        const text = await res.text();
        console.warn('Company orders fetch failed:', res.status, text);
        if (res.status === 404) return [];
        throw new Error(`Failed to fetch company orders: ${res.status} ${text}`);
      }
      return res.json();
    },
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: async (id: number | string) => {
      console.log('Confirming order:', { id, url: `${API_BASE_URL}/orders/${id}/confirm` });
      const res = await authenticatedFetch(`${API_BASE_URL}/orders/${id}/confirm`, { method: "PUT" });
      if (!res.ok) {
        const text = await res.text();
        console.error('Confirm order failed:', { status: res.status, statusText: res.statusText, body: text });
        throw new Error(`Confirm failed: ${res.status} ${text || res.statusText}`);
      }
      return res.json();
    },
    onSuccess: () => {
      alert('Order confirmed successfully!');
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const confirmCompanyOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/company-orders/${id}/confirm`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Confirm failed: ${res.status} ${text}`);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-orders"] }),
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

  console.log('Total orders fetched:', orders?.length, 'Mapped orders:', mappedOrders.length);
  console.log('Company orders fetched:', companyOrders?.length);
  const mappedCompanyOrders = (companyOrders || []).map((o) => ({
    id: o.id,
    company: o.company_name,
    contact: o.person_name || o.contact_person || "—",
    email: o.email,
    phone: o.phone,
    itemsCount: o.order_items?.length || 0,
    status: o.confirmed ? "Completed" : "Pending",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "-",
    raw: o,
  })) as Array<{
    id: string;
    company: string;
    contact: string;
    email: string;
    phone: string;
    itemsCount: number;
    status: "Pending" | "Completed" | "Cancelled";
    date: string;
    raw: CompanyOrder;
  }>;

  const filteredOrders = mappedOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanyOrders = mappedCompanyOrders.filter(
    (order) =>
      order.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmOrder = async (displayedOrderId: string) => {
    if (!confirm("Confirm this order as completed?")) return;
    const entry = mappedOrders.find((m) => m.id === displayedOrderId);
    if (!entry) return alert("Order not found in list");
    
    console.log('Attempting to confirm order:', { 
      displayedId: displayedOrderId, 
      apiId: entry.apiId,
      orderData: entry.raw 
    });
    
    try {
      await confirmMutation.mutateAsync(entry.apiId);
      // success handled by invalidate
    } catch (err) {
      const errorMsg = (err as Error).message || "Failed to confirm order";
      console.error('Confirm order error:', err);
      
      if (errorMsg.includes("404") || errorMsg.includes("not found")) {
        alert("Order not found in database. It may have been deleted. The page will refresh.");
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleConfirmCompanyOrder = async (orderId: string) => {
    if (!confirm("Confirm this company order?")) return;
    try {
      await confirmCompanyOrderMutation.mutateAsync(orderId);
      alert("Company order confirmed successfully!");
    } catch (err) {
      alert((err as Error).message || "Failed to confirm company order");
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

            {(isLoading || isLoadingCompanyOrders) && (
              <div className="text-gray-400 mb-4">Loading orders...</div>
            )}

            {/* Company Orders Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-white">Company Orders</h2>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact Person</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Items</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredCompanyOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                          No company orders found
                        </td>
                      </tr>
                    ) : (
                      filteredCompanyOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{order.company}</td>
                          <td className="px-6 py-4 text-white">{order.contact}</td>
                          <td className="px-6 py-4 text-gray-400">{order.email}</td>
                          <td className="px-6 py-4 text-gray-400">{order.phone}</td>
                          <td className="px-6 py-4 text-white">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
                              {order.itemsCount} items
                            </span>
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
                                onClick={() => setSelectedCompanyOrder(order.raw)}
                              >
                                <Eye size={18} className="text-primary" />
                              </button>
                              {order.status === "Pending" && (
                                <button 
                                  onClick={() => handleConfirmCompanyOrder(order.id)}
                                  className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                                  title="Confirm Order"
                                >
                                  <CheckCircle size={18} className="text-green-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Regular Orders Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Customer Orders</h2>
              
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
                          {order.total.toFixed(2)} DA
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
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-6 mt-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Company Orders</p>
                <p className="text-3xl font-bold text-primary">{mappedCompanyOrders.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-white">{mappedOrders.length}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {[...mappedOrders, ...mappedCompanyOrders].filter((o) => o.status === "Pending").length}
                </p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">
                  {mappedOrders
                    .filter((order) => order.status === "Completed")
                    .reduce((sum, order) => sum + order.total, 0)
                    .toFixed(2)} DA
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onConfirm={() => { setSelectedOrder(null); }} />
      )}
      {selectedCompanyOrder && (
        <CompanyOrderModal order={selectedCompanyOrder} onClose={() => setSelectedCompanyOrder(null)} />
      )}
    </ProtectedRoute>
  );
}


