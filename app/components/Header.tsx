"use client";

import { useEffect, useState } from "react";
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
      </div>
    </header>
  );
}
