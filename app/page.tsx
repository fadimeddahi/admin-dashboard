"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, isStaff, isAdmin } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    
    // If user is authenticated and is staff, go to appropriate landing page
    if (token && isStaff()) {
      router.push(isAdmin() ? "/dashboard" : "/products");
    } else {
      // Otherwise go to login
      router.push("/login");
    }
  }, [router]);

  return null;
}
