import React, { useState } from "react";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import type { Order } from "../types/orders";

export default function OrderDetailsModal({
  order,
  onClose,
  onConfirm,
}: {
  order: Order;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [expandCustomer, setExpandCustomer] = useState(false);

  const fmt = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? `$${n.toFixed(2)}` : "—";
  };

  const lineTotal = (it: import("../types/orders").OrderItem) => {
    const p = Number(it.price ?? 0);
    const q = Number(it.quantity ?? 0);
    const total = Number.isFinite(p) && Number.isFinite(q) ? p * q : 0;
    return `$${total.toFixed(2)}`;
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Order Details</h3>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-300">
          <div>
            <p className="text-gray-400">Order ID</p>
            <p className="text-white font-mono">{order.number ?? order.id}</p>
          </div>
          <div>
            <p className="text-gray-400">Placed</p>
            <p className="text-white">{order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</p>
          </div>
          <div>
            <p className="text-gray-400">Customer</p>
            <p className="text-white">{order.full_name ?? order.email ?? "-"}</p>
          </div>
          <div>
            <p className="text-gray-400">Phone</p>
            <p className="text-white">{order.phone_number ?? "-"}</p>
          </div>
        </div>

        {order.customer && (
          <div className="mb-4 border border-zinc-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandCustomer(!expandCustomer)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User size={20} className="text-primary" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Customer Account</p>
                  <p className="text-xs text-gray-400">{order.customer.name}</p>
                </div>
              </div>
              {expandCustomer ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </button>

            {expandCustomer && (
              <div className="border-t border-zinc-700 p-4 bg-zinc-800/30">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Account Name</p>
                    <p className="text-white font-semibold">{order.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{order.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{order.customer.phone ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Member Since</p>
                    <p className="text-white">
                      {order.customer.created_at
                        ? new Date(order.customer.created_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  {order.customer.order_count !== undefined && (
                    <div>
                      <p className="text-gray-400">Total Orders</p>
                      <p className="text-white font-semibold">{order.customer.order_count}</p>
                    </div>
                  )}
                  {order.customer.total_spent !== undefined && (
                    <div>
                      <p className="text-gray-400">Total Spent</p>
                      <p className="text-white font-semibold">
                        ${(order.customer.total_spent / 100).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {order.customer.address && (
                    <div className="col-span-2">
                      <p className="text-gray-400">Address</p>
                      <p className="text-white">{order.customer.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Shipping</p>
          <p className="text-white">{typeof order.shipping_price === "number" ? `$${order.shipping_price.toFixed(2)}` : "—"}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-white text-2xl font-bold">{fmt(order.total)}</p>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">Order Items</h4>
          <div className="space-y-3">
            {(order.order_items || []).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No items in this order</p>
            ) : (
              (order.order_items || []).map((it) => {
                const rawPrice = it.price;
                const priceNum = Number(rawPrice);
                const quantity = Number(it.quantity ?? 1);
                const validPrice = Number.isFinite(priceNum) && priceNum > 0;
                const itemTotal = validPrice ? priceNum * quantity : 0;
                
                return (
                  <div key={it.id} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium text-sm truncate">
                            Product ID: {it.product_id}
                          </span>
                          <span className="flex-shrink-0 px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-semibold">
                            Qty: {quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {validPrice ? (
                            <>
                              <span>Unit Price: ${priceNum.toFixed(2)}</span>
                              <span className="text-gray-600">•</span>
                              <span>Subtotal: ${itemTotal.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-amber-400">⚠️ Price not available</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-white font-bold text-lg">
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {order.notes && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm">Notes</p>
            <p className="text-white">{order.notes}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-zinc-800 rounded-lg text-gray-300">
            Close
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary text-black rounded-lg">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
