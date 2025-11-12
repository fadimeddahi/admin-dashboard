"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { createMonitor, updateMonitor, deleteMonitor, type Monitor } from "@/lib/components";
import { authenticatedFetch, API_BASE_URL } from "@/lib/auth";

interface MonitorFormData {
  name: string;
  size: number;
  refresh_rate: number;
  price: number;
}

const initialFormData: MonitorFormData = {
  name: "",
  size: 0,
  refresh_rate: 0,
  price: 0,
};

export default function MonitorComponentManager() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MonitorFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: monitors = [], isLoading: isFetching } = useQuery({
    queryKey: ["monitors"],
    queryFn: async () => {
      const response = await authenticatedFetch(`${API_BASE_URL}/components/monitor`);
      if (!response.ok) throw new Error("Failed to fetch monitors");
      return response.json() as Promise<Monitor[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Monitor, "id">) => createMonitor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      resetForm();
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Monitor, "id">> }) =>
      updateMonitor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      resetForm();
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMonitor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (monitor: Monitor) => {
    setEditingId(monitor.id);
    setFormData({
      name: monitor.name,
      size: monitor.size,
      refresh_rate: monitor.refresh_rate,
      price: monitor.price,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this monitor?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const closeModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Monitor Components</h2>
          <p className="text-gray-400 mt-1">Manage monitor inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Monitor
        </button>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-4 h-64 animate-pulse" />
          ))}
        </div>
      ) : monitors.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-8 text-center text-gray-400">
          <p>No monitors added yet. Create your first monitor component!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitors.map((monitor) => (
            <div
              key={monitor.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-white truncate">{monitor.name}</h3>
                <p className="text-sm text-gray-400">{monitor.size}&quot; Monitor</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-black/30 rounded p-2">
                  <p className="text-gray-400">Size</p>
                  <p className="text-white font-semibold">{monitor.size}&quot;</p>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <p className="text-gray-400">Refresh Rate</p>
                  <p className="text-white font-semibold">{monitor.refresh_rate}Hz</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                <p className="text-lg font-bold text-primary">${monitor.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(monitor)}
                    className="p-2 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(monitor.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-zinc-700 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg shadow-lg max-w-md w-full mx-4 border border-zinc-800">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? "Edit Monitor" : "Add New Monitor"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., LG UltraWide 34"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Size (&quot;)</label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    min="1"
                    step="0.1"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Refresh Rate (Hz)</label>
                  <input
                    type="number"
                    name="refresh_rate"
                    value={formData.refresh_rate}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              {(createMutation.isError || updateMutation.isError) && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-sm text-red-400">
                  {createMutation.error?.message || updateMutation.error?.message || "An error occurred"}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-black font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
