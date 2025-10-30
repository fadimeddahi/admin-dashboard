import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  isLoading?: boolean;
}

export default function StatCard({ name, value, icon: Icon, color, isLoading }: StatCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-primary transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{name}</p>
          {isLoading ? (
            <div className="h-10 w-24 bg-zinc-800 animate-pulse rounded mt-2" />
          ) : (
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}
