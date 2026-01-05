"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingCart, Activity, FileText, LogOut, Cpu, Tag, Zap } from "lucide-react";
import { clearAuthData } from "../../lib/auth";

const mainNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Slider", href: "/slider", icon: Zap },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Logs", href: "/logs", icon: Activity },
];

const componentNavigation = [
  { name: "CPU", href: "/components/cpu", icon: Cpu },
  { name: "RAM", href: "/components/ram", icon: Package },
  { name: "Storage", href: "/components/storage", icon: Package },
  { name: "Motherboard", href: "/components/motherboard", icon: Cpu },
  { name: "Monitor", href: "/components/monitor", icon: Package },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthData();
    router.push("/login");
  };

  return (
    <div className="w-64 bg-zinc-900 min-h-screen border-r border-zinc-800 flex flex-col">
      <div className="p-6 flex flex-col items-center gap-3">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={120} 
          height={120}
          className="object-contain"
        />
        <h1 className="text-2xl font-bold text-primary text-center">Admin Panel</h1>
      </div>
      
      <nav className="px-4 space-y-2 flex-1">
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-black font-semibold"
                  : "text-gray-300 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-zinc-700">
          <p className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Components</p>
          {componentNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-primary text-black font-semibold"
                    : "text-gray-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
