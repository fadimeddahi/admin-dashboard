"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, AlertCircle } from "lucide-react";
import { authenticatedFetch, API_BASE_URL } from "../../lib/auth";
import { Category } from "../types/products";
import Image from "next/image";

export default function CategoryManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await authenticatedFetch(`${API_BASE_URL}/categories/all`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await authenticatedFetch(`${API_BASE_URL}/categories/create`, {
        method: "POST",
        body: data,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to create category: ${text}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setFormData({ name: "", description: "" });
      setImageFile(null);
      setImagePreview("");
      setIsModalOpen(false);
      setErrorMessage("");
      setSuccessMessage("Category created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Category name is required");
      return;
    }

    const form = new FormData();
    form.append("category", JSON.stringify({
      Name: formData.name,
      Description: formData.description,
    }));

    if (imageFile) {
      form.append("image", imageFile);
    }

    createMutation.mutate(form);
  };

  const handleReset = () => {
    setFormData({ name: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setErrorMessage("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Categories</h2>
          <p className="text-gray-400">Manage product categories</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-gray-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {category.image_url && (
                <div className="relative w-full h-40 bg-zinc-800">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-400 mb-3">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  ID: {category.id.substring(0, 8)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Create Category</h3>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                type="button"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Error Message */}
              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Category Image
                </label>
                {imagePreview && (
                  <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden border border-zinc-700">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-sm text-gray-400">
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </span>
                </label>
              </div>

              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Laptops, Desktops"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  required
                  disabled={createMutation.isPending}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Category description"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white min-h-[100px]"
                  disabled={createMutation.isPending}
                />
              </div>
            </form>

            {/* Modal Actions */}
            <div className="p-6 border-t border-zinc-800 flex gap-3">
              <button
                onClick={handleReset}
                type="button"
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleSubmit(e as React.MouseEvent<HTMLButtonElement>)}
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
