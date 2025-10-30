import React from "react";
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

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Shipping</p>
          <p className="text-white">{typeof order.shipping_price === "number" ? `$${order.shipping_price.toFixed(2)}` : "—"}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-white text-2xl font-bold">{fmt(order.total)}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-400 text-sm">Items</p>
          <div className="mt-2 space-y-2">
            {(order.order_items || []).map((it) => {
              const rawPrice = it.price;
              const priceNum = Number(rawPrice);
              const missingPrice = !Number.isFinite(priceNum) || priceNum <= 0;
              return (
                <div key={it.id} className="p-3 bg-zinc-800 rounded-lg flex justify-between items-center">
                  <div className="text-sm text-gray-300">
                    <div>Product ID: {it.product_id} × {it.quantity}</div>
                    {missingPrice ? (
                      <div className="text-xs text-amber-400 mt-1">Missing or invalid price (raw: {String(rawPrice)})</div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">Unit price: ${priceNum.toFixed(2)}</div>
                    )}
                  </div>
                  <div className="text-white font-semibold">{lineTotal(it)}</div>
                </div>
              );
            })}
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
