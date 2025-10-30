"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Package, ShoppingCart, LogOut } from "lucide-react";
import { clearAuthData } from "../../lib/auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Products", href: "/products", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
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
        {navigation.map((item) => {
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
