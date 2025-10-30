"use client";

import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

const stats = [
  {
    name: "Total Revenue",
    value: "$45,231",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    name: "Total Orders",
    value: "356",
    icon: ShoppingCart,
    color: "bg-blue-500",
  },
  {
    name: "Total Products",
    value: "128",
    icon: Package,
    color: "bg-purple-500",
  },
  {
    name: "Total Customers",
    value: "892",
    icon: Users,
    color: "bg-primary",
  },
];

const salesData = [
  { day: "Mon", sales: 4200 },
  { day: "Tue", sales: 3800 },
  { day: "Wed", sales: 5100 },
  { day: "Thu", sales: 4600 },
  { day: "Fri", sales: 6200 },
  { day: "Sat", sales: 5800 },
  { day: "Sun", sales: 4900 },
];

export default function DashboardPage() {
  const maxSales = Math.max(...salesData.map((d) => d.sales));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your business metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.name}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Sales Trend (Last 7 Days)</h2>
        <div className="space-y-4">
          {salesData.map((data) => {
            const percentage = (data.sales / maxSales) * 100;
            return (
              <div key={data.day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 w-12">{data.day}</span>
                  <span className="text-white font-semibold">${data.sales.toLocaleString()}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
