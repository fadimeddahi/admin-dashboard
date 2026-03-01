"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isStaff, isAdmin, getToken } from "../../lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** "staff" allows admin + moderator; "admin" restricts to admin only. Default: "staff" */
  requiredRole?: "staff" | "admin";
}

export default function ProtectedRoute({ children, requiredRole = "staff" }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      router.push("/login");
      return;
    }

    const hasAccess = requiredRole === "admin" ? isAdmin() : isStaff();
    if (!hasAccess) {
      // Moderator trying to access admin-only page → redirect to a staff-accessible page
      if (isStaff()) {
        router.push("/products");
      } else {
        router.push("/login");
      }
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
