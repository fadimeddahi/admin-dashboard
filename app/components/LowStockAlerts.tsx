import React from "react";
import { AlertTriangle } from "lucide-react";
import type { LowStockProduct } from "../types/dashboard";

interface LowStockAlertsProps {
  products: LowStockProduct[];
  isLoading?: boolean;
}

export default function LowStockAlerts({ products, isLoading }: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={24} />
          Low Stock Alerts
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-zinc-800 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <AlertTriangle className="text-amber-500" size={24} />
        Low Stock Alerts
      </h2>
      {products.length === 0 ? (
        <p className="text-gray-400 text-center py-8">All products are in stock</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.barcode}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-bold">{product.quantity} left</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
