"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import { authenticatedFetch } from "../../lib/auth";
import { Product } from "../types/products";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import Image from "next/image";

interface SliderItem {
  id: string;
  product_id: string;
  product?: Product;
  order: number;
  is_active: boolean;
  created_at?: string;
}

export default function SliderPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Fetch slider items
  const {
    data: sliderItems = [],
    isLoading: loadingSlider,
  } = useQuery<SliderItem[]>({
    queryKey: ["slider"],
    queryFn: async () => {
      const response = await authenticatedFetch("https://api.primecomputerdz.dz/slider/all");
      if (!response.ok) throw new Error("Failed to fetch slider items");
      return response.json();
    },
  });

  // Fetch products for selection
  const {
    data: products = [],
    isLoading: loadingProducts,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await authenticatedFetch("https://api.primecomputerdz.dz/products/all");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Add product to slider
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await authenticatedFetch("https://api.primecomputerdz.dz/slider/add", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          order: sliderItems.length + 1,
        }),
      });
      if (!response.ok) throw new Error("Failed to add product to slider");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider"] });
      setIsModalOpen(false);
      setSelectedProductId("");
    },
  });

  // Remove from slider
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await authenticatedFetch(`https://api.primecomputerdz.dz/slider/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove from slider");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider"] });
    },
  });

  // Toggle visibility
  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const item = sliderItems.find((i) => i.id === itemId);
      const response = await authenticatedFetch(`https://api.primecomputerdz.dz/slider/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({
          is_active: !item?.is_active,
        }),
      });
      if (!response.ok) throw new Error("Failed to update slider item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slider"] });
    },
  });

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || "Unknown";
  };

  const getProductDetails = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const loading = loadingSlider || loadingProducts;

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header title="Slider Management" />
          <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Slider</h2>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : sliderItems.length === 0 ? (
              <Card className="p-8 text-center text-gray-500">
                No products in slider. Add one to get started.
              </Card>
            ) : (
              <div className="grid gap-4">
                {sliderItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const product = getProductDetails(item.product_id);
                    return (
                      <Card key={item.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-lg font-bold text-gray-400 w-8">
                            {item.order}
                          </div>
                          {product?.image_url && (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={80}
                              height={80}
                              className="rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{product?.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product?.description}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="font-bold text-blue-600">
                                ${product?.price}
                              </span>
                              {product?.discount && (
                                <span className="text-green-600">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleMutation.mutate(item.id)}
                            className="p-2 hover:bg-gray-200 rounded transition"
                            title={item.is_active ? "Hide" : "Show"}
                          >
                            {item.is_active ? (
                              <Eye className="w-5 h-5 text-blue-600" />
                            ) : (
                              <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="p-2 hover:bg-red-100 rounded transition text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}

            {/* Modal to select product */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md p-6">
                  <h3 className="text-lg font-bold mb-4">Add Product to Slider</h3>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4 bg-white text-black"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-black"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() =>
                        selectedProductId && addMutation.mutate(selectedProductId)
                      }
                      disabled={!selectedProductId || addMutation.isPending}
                      className="flex-1"
                    >
                      {addMutation.isPending ? "Adding..." : "Add"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
