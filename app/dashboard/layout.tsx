import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
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
