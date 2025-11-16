"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isAdmin } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    
    // If user is authenticated and is admin, go to dashboard
    if (token && isAdmin()) {
      router.push("/dashboard");
    } else {
      // Otherwise go to login
      router.push("/login");
    }
  }, [router]);

  return null;
}
