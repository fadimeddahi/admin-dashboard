"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import CategoryManager from "../components/CategoryManager";

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-8 bg-black min-h-screen">
            <CategoryManager />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
