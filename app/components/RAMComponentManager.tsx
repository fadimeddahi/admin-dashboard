"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { createRAM, updateRAM, deleteRAM, type RAM } from "@/lib/components";
import { authenticatedFetch, API_BASE_URL } from "@/lib/auth";

interface RAMFormData {
  name: string;
  type: string;
  capacity: number;
  speed: number;
  price: number;
}

const initialFormData: RAMFormData = {
  name: "",
  type: "",
  capacity: 0,
  speed: 0,
  price: 0,
};

export default function RAMComponentManager() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RAMFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rams = [], isLoading: isFetching } = useQuery({
    queryKey: ["rams"],
    queryFn: async () => {
      const response = await authenticatedFetch(`${API_BASE_URL}/components/ram`);
      if (!response.ok) throw new Error("Failed to fetch RAM");
      return response.json() as Promise<RAM[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<RAM, "id">) => createRAM(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rams"] });
      resetForm();
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<RAM, "id">> }) =>
      updateRAM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rams"] });
      resetForm();
      setIsModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRAM(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rams"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" || name === "type" ? value : Number(value),
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

  const handleEdit = (ram: RAM) => {
    setEditingId(ram.id);
    setFormData({
      name: ram.name,
      type: ram.type,
      capacity: ram.capacity,
      speed: ram.speed,
      price: ram.price,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this RAM?")) {
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
          <h2 className="text-2xl font-bold text-white">RAM Components</h2>
          <p className="text-gray-400 mt-1">Manage memory inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add RAM
        </button>
      </div>

      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-lg p-4 h-64 animate-pulse" />
          ))}
        </div>
      ) : rams.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-8 text-center text-gray-400">
          <p>No RAM added yet. Create your first RAM component!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rams.map((ram) => (
            <div
              key={ram.id}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-white truncate">{ram.name}</h3>
                <p className="text-sm text-gray-400">{ram.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-black/30 rounded p-2">
                  <p className="text-gray-400">Capacity</p>
                  <p className="text-white font-semibold">{ram.capacity}GB</p>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <p className="text-gray-400">Speed</p>
                  <p className="text-white font-semibold">{ram.speed}MHz</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                <p className="text-lg font-bold text-primary">${ram.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ram)}
                    className="p-2 hover:bg-zinc-700 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(ram.id)}
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
                {editingId ? "Edit RAM" : "Add New RAM"}
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
                  placeholder="e.g., Corsair Vengeance RGB Pro"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., DDR5"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Capacity (GB)</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Speed (MHz)</label>
                  <input
                    type="number"
                    name="speed"
                    value={formData.speed}
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
