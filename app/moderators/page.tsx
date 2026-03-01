"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Shield, User, Mail, Calendar } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Moderator {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

interface CreateModeratorForm {
  username: string;
  email: string;
  password: string;
}

export default function ModeratorsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateModeratorForm>({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");

  // Fetch moderators
  const { data: moderators = [], isLoading } = useQuery<Moderator[]>({
    queryKey: ["moderators"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/admin/moderators`);
      if (!res.ok) throw new Error("Failed to fetch moderators");
      return res.json();
    },
  });

  // Create moderator
  const createMutation = useMutation({
    mutationFn: async (data: CreateModeratorForm) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/admin/moderators`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Failed to create moderator");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      setShowModal(false);
      setForm({ username: "", email: "", password: "" });
      setFormError("");
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  // Delete moderator
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/admin/moderators/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || err.error || "Failed to delete moderator");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderators"] });
      setDeleteConfirmId(null);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.username || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    createMutation.mutate(form);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-4 lg:p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Shield className="w-7 h-7 text-primary" />
                  <h1 className="text-2xl font-bold text-white">Moderators</h1>
                </div>
                <p className="text-gray-400 text-sm">Manage staff moderator accounts</p>
              </div>
              <Button onClick={() => { setShowModal(true); setFormError(""); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Moderator
              </Button>
            </div>

            {/* Moderators Table */}
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : moderators.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-gray-400">No moderators found.</p>
                <p className="text-gray-500 text-sm mt-1">Click &quot;Add Moderator&quot; to create one.</p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Verified</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {moderators.map((mod) => (
                      <tr key={mod.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{mod.username}</p>
                              <p className="text-xs text-gray-500">{mod.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            {mod.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            mod.email_verified
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-400"
                          }`}>
                            {mod.email_verified ? "Verified" : "Unverified"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(mod.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {deleteConfirmId === mod.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-gray-400">Confirm?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteMutation.mutate(mod.id)}
                                disabled={deleteMutation.isPending}
                              >
                                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(mod.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete moderator"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Moderator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-white">Create Moderator</h2>
            </div>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mod-username">Username</Label>
                <Input
                  id="mod-username"
                  placeholder="moderator_user"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-email">Email</Label>
                <Input
                  id="mod-email"
                  type="email"
                  placeholder="moderator@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mod-password">Password</Label>
                <Input
                  id="mod-password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={createMutation.isPending}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Moderator"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowModal(false); setFormError(""); }}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
