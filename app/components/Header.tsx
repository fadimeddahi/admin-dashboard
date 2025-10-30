"use client";

import { useEffect, useState } from "react";
import { Bell, User } from "lucide-react";
import { getUsername } from "../../lib/auth";

export default function Header() {
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const storedUsername = getUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome back, {username}</h2>
          <p className="text-sm text-gray-400">Here&apos;s what&apos;s happening today</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Bell size={20} className="text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User size={18} className="text-black" />
            </div>
            <span className="text-sm text-gray-300">{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
