"use client";

import { useEffect, useState } from "react";
import { getUsername, getUserRole } from "../../lib/auth";
import type { UserRole } from "../../lib/store/authStore";

export default function Header() {
  const [username, setUsername] = useState("Admin");
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedUsername = getUsername();
    if (storedUsername) {
      setUsername(storedUsername);
    }
    setRole(getUserRole());
  }, []);

  const roleLabel = role === "admin" ? "Admin" : role === "moderator" ? "Moderator" : "User";

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Welcome back, {username}</h2>
          <p className="text-sm text-gray-400">Logged in as <span className="text-primary font-medium">{roleLabel}</span></p>
        </div>
      </div>
    </header>
  );
}
