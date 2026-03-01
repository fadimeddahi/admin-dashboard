import type { Metadata } from "next";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";

export const metadata: Metadata = {
  title: "Activity Logs | Admin Dashboard",
  description: "View and manage activity logs and audit trail",
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
