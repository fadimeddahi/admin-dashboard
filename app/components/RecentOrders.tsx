import React from "react";
import type { RecentOrder } from "../types/dashboard";

interface RecentOrdersProps {
  orders: RecentOrder[];
  isLoading?: boolean;
}

export default function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-800 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No recent orders</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div>
                <p className="text-white font-medium">
                  {order.number || `Order #${order.id}`}
                </p>
                <p className="text-gray-400 text-sm">
                  {order.full_name || order.email || "Unknown customer"}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{order.total.toFixed(2)} DA</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    order.confirmed
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {order.confirmed ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
