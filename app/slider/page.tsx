"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Eye, EyeOff, Edit, GripVertical, Image as ImageIcon } from "lucide-react";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";
import Image from "next/image";

interface Slider {
  id: string;
  title: string;
  image_url: string;
  link: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SliderFormData {
  title: string;
  link: string;
  order: number;
  is_active: boolean;
  image: File | null;
}

export default function SliderPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState<SliderFormData>({
    title: "",
    link: "",
    order: 0,
    is_active: true,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch all sliders
  const { data: sliders = [], isLoading } = useQuery<Slider[]>({
    queryKey: ["sliders"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/sliders/all`);
      if (!res.ok) throw new Error("Failed to fetch sliders");
      return res.json();
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Create slider
  const createMutation = useMutation({
    mutationFn: async (data: SliderFormData) => {
      const formDataObj = new FormData();
      formDataObj.append("title", data.title);
      formDataObj.append("link", data.link);
      formDataObj.append("order", data.order.toString());
      formDataObj.append("is_active", data.is_active.toString());
      if (data.image) {
        formDataObj.append("image", data.image);
      }

      const res = await authenticatedFetch(`${API_BASE_URL}/sliders`, {
        method: "POST",
        body: formDataObj,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to create slider: ${error}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
      closeModal();
    },
  });

  // Update slider
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SliderFormData }) => {
      const formDataObj = new FormData();
      formDataObj.append("title", data.title);
      formDataObj.append("link", data.link);
      formDataObj.append("order", data.order.toString());
      formDataObj.append("is_active", data.is_active.toString());
      if (data.image) {
        formDataObj.append("image", data.image);
      }

      const res = await authenticatedFetch(`${API_BASE_URL}/sliders/${id}`, {
        method: "PUT",
        body: formDataObj,
      });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to update slider: ${error}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
      closeModal();
    },
  });

  // Delete slider
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/sliders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete slider");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });

  // Toggle active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/sliders/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active }),
      });
      if (!res.ok) throw new Error("Failed to toggle slider status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
  });

  const openCreateModal = () => {
    setEditingSlider(null);
    setFormData({
      title: "",
      link: "",
      order: sliders.length + 1,
      is_active: true,
      image: null,
    });
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      link: slider.link,
      order: slider.order,
      is_active: slider.is_active,
      image: null,
    });
    setImagePreview(slider.image_url);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlider(null);
    setFormData({
      title: "",
      link: "",
      order: 0,
      is_active: true,
      image: null,
    });
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.link) {
      alert("Please fill in all required fields");
      return;
    }
    if (!editingSlider && !formData.image) {
      alert("Please upload an image");
      return;
    }

    if (editingSlider) {
      updateMutation.mutate({ id: editingSlider.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this slider?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Slider Management</h1>
            <p className="text-gray-400">Manage homepage carousel sliders</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            Add Slider
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading sliders...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sliders yet</h3>
            <p className="text-gray-400 mb-6">Create your first slider to get started</p>
            <button
              onClick={openCreateModal}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Slider
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sliders
              .sort((a, b) => a.order - b.order)
              .map((slider) => (
                <div
                  key={slider.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-gray-500">
                      <GripVertical className="w-5 h-5" />
                      <span className="text-lg font-bold w-8">{slider.order}</span>
                    </div>

                    <div className="relative w-32 h-20 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={slider.image_url}
                        alt={slider.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg mb-1">{slider.title}</h3>
                      <p className="text-gray-400 text-sm truncate">Link: {slider.link}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            slider.is_active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {slider.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          toggleMutation.mutate({
                            id: slider.id,
                            is_active: !slider.is_active,
                          })
                        }
                        className="p-2 hover:bg-zinc-800 rounded transition"
                        title={slider.is_active ? "Deactivate" : "Activate"}
                      >
                        {slider.is_active ? (
                          <Eye className="w-5 h-5 text-green-400" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(slider)}
                        className="p-2 hover:bg-zinc-800 rounded transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="p-2 hover:bg-red-500/20 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingSlider ? "Edit Slider" : "Create New Slider"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., Summer Sale 2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Link *</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., /products/laptops"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Status</label>
                    <select
                      value={formData.is_active.toString()}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.value === "true" })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">
                    Image {!editingSlider && "*"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Recommended: 1920x600px (16:9), Max 5MB
                  </p>
                </div>

                {imagePreview && (
                  <div className="relative w-full h-48 bg-zinc-800 rounded overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingSlider
                    ? "Update Slider"
                    : "Create Slider"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
