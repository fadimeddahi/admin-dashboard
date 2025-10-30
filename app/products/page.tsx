"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, Copy, Download } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ProtectedRoute from "../components/ProtectedRoute";
import Image from "next/image";
import { authenticatedFetch, isAdmin } from "../../lib/auth";
import { Product, TabType, Category } from "../types/products";
import ProductModal from "../components/ProductModal";
// ============================================
// TYPES & INTERFACES
// ============================================

  // ============================================
  // MAIN COMPONENT
  // ============================================

export default function ProductsPage() {
  // State Management
  // const queryClient = useQueryClient(); // Not used, remove to fix lint error
  // Products
  const {
    data: products = [],
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await authenticatedFetch("https://pcprimedz.onrender.com/products/all");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Categories
  const {
    data: categories = [],
    isLoading: loadingCategories,
  // refetch: refetchCategories, // Not used, remove to fix lint error
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await authenticatedFetch("https://pcprimedz.onrender.com/categories/all");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const loading = loadingProducts || loadingCategories;
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Use shared TabType values for tabs
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    quantity: 0,
    barcode: "",
    brand: "",
    price: 0,
    discount: 0,
    warranty_months: 12,
    original_price: 0,
    category_id: 1,
    image_url: "",
    old_price: 0,
    is_promo: false,
    etat: "Neuf",
    garantie: "",
    retour: "",
    cpu: "",
    ram: "",
    storage: "",
    screen: "",
    battery: "",
    camera: "",
    refroidissement: "",
    système: "",
    gpu: "",
    alimentation: "",
    boîtier: "",
  });

  // Utility: Export filtered products to CSV
  const exportToCSV = () => {
    const rows = filteredProducts.map((p: Product) => [
      p.id,
      p.name,
      p.barcode,
      p.brand,
      p.category_id,
      p.price,
      p.quantity,
      p.etat,
      p.is_promo ? 'Yes' : 'No',
    ]);
    const header = [
      'ID', 'Name', 'Barcode', 'Brand', 'Category', 'Price', 'Quantity', 'Etat', 'Promo'
    ];
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utility: Toggle select all filtered products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p: Product) => p.id));
    }
  };

  // Utility: Toggle select a single product
  const toggleSelect = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // ============================================
  // DATA FETCHING
  // ============================================

  // useEffect and fetch functions removed; now handled by React Query

  // ============================================
  // FILTERING LOGIC
  // ============================================

  const filteredProducts = ((products ?? []) as Product[]).filter((product: Product) => {
    const term = searchTerm.toLowerCase();
    const name = (product.name ?? "").toString().toLowerCase();
    const barcode = (product.barcode ?? "").toString().toLowerCase();
    const brand = (product.brand ?? "").toString().toLowerCase();
    const cpu = (product.cpu ?? "").toString().toLowerCase();
    const gpu = (product.gpu ?? "").toString().toLowerCase();

    const matchesSearch =
      name.includes(term) || 
      barcode.includes(term) || 
      brand.includes(term) ||
      cpu.includes(term) ||
      gpu.includes(term);
    
    const matchesCategory = categoryFilter === "All" || product.category_id === parseInt(categoryFilter);
    
    const matchesStock = 
      stockFilter === "All" ||
      (stockFilter === "In Stock" && product.quantity > 10) ||
      (stockFilter === "Low Stock" && product.quantity <= 10 && product.quantity > 0) ||
      (stockFilter === "Out of Stock" && product.quantity === 0);
    
    // Map typeFilter to etat values
    let matchesType = typeFilter === "All";
    if (typeFilter === "New") matchesType = product.etat === "Neuf";
    else if (typeFilter === "Used") matchesType = product.etat === "Excellent" || product.etat === "Tres Bon" || product.etat === "Bon" || product.etat === "Acceptable";
    else if (typeFilter === "Promo") matchesType = !!product.is_promo;

    return matchesSearch && matchesCategory && matchesStock && matchesType;
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const generateBarcode = () => {
    return `BRC${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const getCategoryName = (categoryId: number) => {
  return ((categories ?? []) as Category[]).find((c: Category) => c.id === categoryId)?.name || `Category ${categoryId}`;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quantity: 0,
      barcode: generateBarcode(),
      brand: "",
      price: 0,
      discount: 0,
      warranty_months: 12,
      original_price: 0,
  category_id: ((categories ?? []) as Category[]).length > 0 ? ((categories ?? []) as Category[])[0].id : 1,
      image_url: "",
      old_price: 0,
      is_promo: false,
      etat: "Neuf",
      garantie: "",
      retour: "",
      cpu: "",
      ram: "",
      storage: "",
      screen: "",
      battery: "",
      camera: "",
      refroidissement: "",
      système: "",
      gpu: "",
      alimentation: "",
      boîtier: "",
    });
  };

  // ============================================
  // CRUD OPERATIONS
  // ============================================

  const handleAdd = () => {
    setEditingProduct(null);
    resetForm();
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleDuplicate = async (product: Product) => {
    try {
      const duplicated = {
        ...product,
        id: undefined,
        name: `${product.name} (Copy)` ,
        barcode: generateBarcode(),
      };
      const response = await authenticatedFetch("https://pcprimedz.onrender.com/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated),
      });
      if (!response.ok) throw new Error("Failed to duplicate product");
      await refetchProducts();
      alert("Product duplicated successfully!");
    } catch (err) {
      console.error("Error duplicating product:", err);
      alert("Failed to duplicate product. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
  const product = (Array.isArray(products) ? products : []).find((p: Product) => p.id === id);
  if (!confirm(`Are you sure you want to delete "${product && (product as Product).name ? (product as Product).name : ''}"?`)) return;
    
    try {
      const response = await authenticatedFetch(`https://pcprimedz.onrender.com/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      await refetchProducts();
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return;
    
    try {
      const deletePromises = selectedProducts.map(id =>
        authenticatedFetch(`https://pcprimedz.onrender.com/products/${id}`, {
          method: "DELETE",
        })
      );
      await Promise.all(deletePromises);
      await refetchProducts();
      setSelectedProducts([]);
      alert("Products deleted successfully!");
    } catch (err) {
      console.error("Error deleting products:", err);
      alert("Failed to delete products. Please try again.");
    }
  };

  // ============================================
  // AUTHORIZATION CHECK
  // ============================================
  if (typeof window !== "undefined" && !isAdmin()) {
    window.location.href = "/login";
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Header />
          <main className="p-4 lg:p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Products</h1>
              <p className="text-gray-400 text-sm">Manage your product inventory</p>
            </div>

            {/* Filters and Actions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 max-w-md min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                >
                  <option value="All">All Categories</option>
                  {((categories ?? []) as Category[]).map((cat: Category) => (
                    <option key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                >
                  <option value="All">All Stock</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
                >
                  <option value="All">All Types</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Promo">Promo</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {selectedProducts.length > 0 && (
                <div className="bg-primary/10 border border-primary rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-primary font-semibold text-sm">
                    {selectedProducts.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedProducts([])}
                      className="px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-gray-400 mt-4">Loading products...</p>
              </div>
            ) : (
              /* Products Table */
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-zinc-800">
                      <tr>
                        <th className="px-2 py-2 text-left w-10">
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-primary bg-zinc-700 border-zinc-600 rounded focus:ring-primary"
                          />
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 w-16">Image</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-300 min-w-[200px]">Product</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 min-w-[140px]">Specs</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 w-20">Cat</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 min-w-[90px]">Price</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 w-16">Stock</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 w-20">Status</th>
                        <th className="px-2 py-2 text-left text-xs font-semibold text-gray-300 w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                            No products found. Try adjusting your filters or add a new product.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product: Product) => (
                          <tr key={product.id} className="hover:bg-zinc-800/50 transition-colors">
                            <td className="px-2 py-2">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleSelect(product.id)}
                                className="w-4 h-4 text-primary bg-zinc-700 border-zinc-600 rounded focus:ring-primary"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center relative overflow-hidden">
                                {product.image_url ? (
                                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                ) : (
                                  <span className="text-gray-500 text-[10px]">IMG</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-white text-sm font-medium line-clamp-1" title={product.name}>{product.name}</span>
                                <span className="text-gray-400 text-[11px]">{product.brand}</span>
                                <span className="text-gray-500 text-[10px] font-mono">{product.barcode}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex flex-col text-[10px] text-gray-400 gap-0.5">
                                {product.cpu && <span className="line-clamp-1" title={product.cpu}>CPU: {product.cpu}</span>}
                                {product.gpu && <span className="line-clamp-1" title={product.gpu}>GPU: {product.gpu}</span>}
                                {product.ram && <span>RAM: {product.ram}</span>}
                                {product.storage && <span>HDD: {product.storage}</span>}
                                {!product.cpu && !product.gpu && !product.ram && !product.storage && (
                                  <span className="text-gray-600">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2 text-gray-400 text-[11px]">
                              <span className="line-clamp-2">{getCategoryName(product.category_id)}</span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-white text-xs font-semibold whitespace-nowrap">
                                  {(product.price / 1000).toFixed(0)}K
                                </span>
                                {product.original_price && product.original_price > product.price && (
                                  <span className="text-gray-500 text-[10px] line-through whitespace-nowrap">
                                    {(product.original_price / 1000).toFixed(0)}K
                                  </span>
                                )}
                                {product.is_promo && (product.discount ?? 0) > 0 && (
                                  <span className="text-green-400 text-[10px]">-{product.discount}%</span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                                product.quantity > 10 ? "bg-green-500/20 text-green-400" :
                                product.quantity > 0 ? "bg-yellow-500/20 text-yellow-400" :
                                "bg-red-500/20 text-red-400"
                              }`}>
                                {product.quantity}
                              </span>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex flex-col gap-0.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium text-center ${
                                  product.quantity > 0
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}>
                                  {product.quantity > 0 ? "Stock" : "Out"}
                                </span>
                                <span className="text-gray-400 text-[10px] capitalize text-center">{product.etat}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit size={14} className="text-primary" />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(product)}
                                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                                  title="Duplicate"
                                >
                                  <Copy size={14} className="text-blue-400" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal */}
            {isModalOpen && (
              <ProductModal
                editingProduct={editingProduct}
                formData={formData}
                setFormData={setFormData}
                activeTab={activeTab}
                setActiveTab={(tab: TabType) => setActiveTab(tab)}
                setIsModalOpen={setIsModalOpen}
                generateBarcode={generateBarcode}
                categories={(categories ?? []) as Category[]}
              />
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
