import { X } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Product, TabType, Category } from "../types/products";
import { getToken } from "../../lib/auth";

interface ProductModalProps {
  editingProduct: Product | null;
  formData: Partial<Product>;
  setFormData: (data: Partial<Product>) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setIsModalOpen: (open: boolean) => void;
  generateBarcode: () => string;
  categories: Category[];
}

const ALLOWED_CONDITIONS = ["Neuf", "Excellent", "Tres Bon", "Bon", "Acceptable"] as const;
type Condition = (typeof ALLOWED_CONDITIONS)[number];

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "pricing", label: "Pricing" },
  { id: "inventory", label: "Inventory" },
  { id: "images", label: "Images" },
  { id: "specifications", label: "Specifications" },
  { id: "marketing", label: "Marketing" },
] as const;

const SPEC_FIELDS = [
  "cpu", "ram", "storage", "screen", "battery", "camera",
  "refroidissement", "système", "gpu", "alimentation", "boîtier"
] as const;

// API Functions
async function createProduct(formData: FormData) {
  const token = getToken();

  // Log request details to debug 401s
  try {
    console.debug("createProduct: sending request", {
      url: 'https://pcprimedz.onrender.com/products/create',
      method: 'POST',
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0, 10)}...${token.slice(-4)}` : null,
      formEntries: Array.from(formData.entries()).map(([k, v]) => ({ k, v: v instanceof File ? `[File:${(v as File).name}]` : String(v).slice(0, 200) })),
    });
  } catch {
    /* ignore logging errors */
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch('https://pcprimedz.onrender.com/products/create', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    try {
      const text = await response.text();
      console.warn('createProduct failed', { status: response.status, body: text });
      const json = JSON.parse(text);
      throw new Error(json.message || json.error || `Failed to create product (${response.status})`);
    } catch {
      // If body isn't JSON
      throw new Error(`Failed to create product (${response.status})`);
    }
  }

  return response.json();
}

async function updateProduct(id: number, formData: FormData) {
  const token = getToken();

  try {
    console.debug("updateProduct: sending request", {
      url: `https://pcprimedz.onrender.com/products/${id}`,
      method: 'PUT',
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0, 10)}...${token.slice(-4)}` : null,
      formEntries: Array.from(formData.entries()).map(([k, v]) => ({ k, v: v instanceof File ? `[File:${(v as File).name}]` : String(v).slice(0, 200) })),
    });
  } catch {
    /* ignore logging errors */
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://pcprimedz.onrender.com/products/${id}`, {
    method: 'PUT',
    headers,
    body: formData,
  });

  if (!response.ok) {
    try {
      const text = await response.text();
      console.warn('updateProduct failed', { status: response.status, body: text });
      const json = JSON.parse(text);
      throw new Error(json.message || json.error || `Failed to update product (${response.status})`);
    } catch {
      throw new Error(`Failed to update product (${response.status})`);
    }
  }

  return response.json();
}

export default function ProductModal({
  editingProduct,
  formData,
  setFormData,
  activeTab,
  setActiveTab,
  setIsModalOpen,
  generateBarcode,
  categories,
}: ProductModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      // Reset form if needed
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', editingProduct?.id] });
      setIsModalOpen(false);
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Generic update that accepts unknown value types (we'll type-check at call sites)
  const updateField = (field: keyof Product, value: unknown) => {
    setFormData({ ...formData, [field]: value } as Partial<Product>);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean and prepare product data
    const productData: Record<string, unknown> = { ...formData };
    delete productData.image_url;

    // Replace null/undefined with empty string
    Object.keys(productData).forEach((key) => {
      if (productData[key] == null) {
        productData[key] = "";
      }
    });

    // Validate and set condition
    const currentCondition = String(productData.etat ?? "");
    productData.etat = (ALLOWED_CONDITIONS as readonly string[]).includes(currentCondition)
      ? (currentCondition as Condition)
      : "Neuf";

    // Create FormData
    // Log the exact JSON we will send to help debug server parse errors
    try {
      const productJson = JSON.stringify(productData);
      console.debug("createProduct: product JSON", productJson.slice(0, 2000));
    } catch {
      console.debug("createProduct: failed to stringify productData for logging");
    }

    const form = new FormData();
    form.append("product", JSON.stringify(productData));
    if (imageFile) {
      form.append("image", imageFile);
    }

    // Submit based on mode
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <Header 
          isEditing={!!editingProduct} 
          onClose={() => setIsModalOpen(false)}
          isLoading={isLoading}
        />

        {/* Tabs */}
        <TabNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          disabled={isLoading}
        />

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "basic" && (
            <BasicInfoTab
              formData={formData}
              updateField={updateField}
              categories={categories}
              generateBarcode={generateBarcode}
              disabled={isLoading}
            />
          )}

          {activeTab === "pricing" && (
            <PricingTab 
              formData={formData} 
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab 
              formData={formData} 
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          {activeTab === "images" && (
            <ImagesTab
              imagePreview={imagePreview}
              handleImageChange={handleImageChange}
              isEditing={!!editingProduct}
              disabled={isLoading}
            />
          )}

          {activeTab === "specifications" && (
            <SpecificationsTab 
              formData={formData} 
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          {activeTab === "marketing" && (
            <MarketingTab 
              formData={formData} 
              updateField={updateField}
              disabled={isLoading}
            />
          )}

          {/* Action Buttons */}
          <FormActions
            isEditing={!!editingProduct}
            onCancel={() => setIsModalOpen(false)}
            isLoading={isLoading}
          />
        </form>
      </div>
    </div>
  );
}

// Sub-components

function Header({ 
  isEditing, 
  onClose, 
  isLoading 
}: { 
  isEditing: boolean; 
  onClose: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-white">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h2>
      <button
        onClick={onClose}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
        type="button"
        disabled={isLoading}
      >
        <X size={24} className="text-gray-400" />
      </button>
    </div>
  );
}

function TabNav({ 
  activeTab, 
  onTabChange,
  disabled 
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex border-b border-zinc-800 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id as TabType)}
          disabled={disabled}
          className={`px-6 py-3 font-medium whitespace-nowrap disabled:opacity-50 ${
            activeTab === tab.id
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function BasicInfoTab({ 
  formData, 
  updateField, 
  categories, 
  generateBarcode,
  disabled 
}: {
  formData: Partial<Product>;
  updateField: <K extends keyof Product>(field: K, value: Product[K]) => void;
  categories: Category[];
  generateBarcode: () => string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <InputField
        label="Product Name"
        value={formData.name || ""}
        onChange={(value) => updateField("name", value)}
        required
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Barcode *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.barcode || ""}
              onChange={(e) => updateField("barcode", e.target.value)}
              className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
              required
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => updateField("barcode", generateBarcode())}
              className="px-4 py-3 bg-primary text-black font-medium rounded-lg disabled:opacity-50"
              disabled={disabled}
            >
              Auto
            </button>
          </div>
        </div>

        <InputField
          label="Brand"
          value={formData.brand || ""}
          onChange={(value) => updateField("brand", value)}
          required
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
        <select
          value={formData.category_id || ""}
          onChange={(e) => updateField("category_id", parseInt(e.target.value))}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
          required
          disabled={disabled}
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
        <select
          value={(ALLOWED_CONDITIONS as readonly string[]).includes(String(formData.etat)) ? (formData.etat as Condition) : "Neuf"}
          onChange={(e) => updateField("etat", e.target.value as Product["etat"]) }
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
          required
          disabled={disabled}
        >
          {ALLOWED_CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
          rows={3}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function PricingTab({ 
  formData, 
  updateField,
  disabled 
}: {
  formData: Partial<Product>;
  updateField: <K extends keyof Product>(field: K, value: Product[K]) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <NumberField
        label="Price"
        value={formData.price}
        onChange={(value) => updateField("price", value)}
        required
        disabled={disabled}
      />
      <NumberField
        label="Original Price"
        value={formData.original_price}
        onChange={(value) => updateField("original_price", value)}
        disabled={disabled}
      />
      <NumberField
        label="Old Price"
        value={formData.old_price}
        onChange={(value) => updateField("old_price", value)}
        disabled={disabled}
      />
      <NumberField
        label="Discount (%)"
        value={formData.discount}
        onChange={(value) => updateField("discount", value)}
        disabled={disabled}
      />
      <NumberField
        label="Warranty (months)"
        value={formData.warranty_months}
        onChange={(value) => updateField("warranty_months", value)}
        disabled={disabled}
      />
    </div>
  );
}

function InventoryTab({ 
  formData, 
  updateField,
  disabled 
}: {
  formData: Partial<Product>;
  updateField: <K extends keyof Product>(field: K, value: Product[K]) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <NumberField
        label="Stock Quantity"
        value={formData.quantity}
        onChange={(value) => updateField("quantity", value)}
        required
        disabled={disabled}
      />
      <InputField
        label="Garantie"
        value={formData.garantie || ""}
        onChange={(value) => updateField("garantie", value)}
        disabled={disabled}
      />
      <InputField
        label="Retour"
        value={formData.retour || ""}
        onChange={(value) => updateField("retour", value)}
        disabled={disabled}
      />
    </div>
  );
}

function ImagesTab({ 
  imagePreview, 
  handleImageChange, 
  isEditing,
  disabled 
}: {
  imagePreview: string;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Product Image {!isEditing && "*"}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
        required={!isEditing}
        disabled={disabled}
      />
      {imagePreview && (
        <Image
          src={imagePreview}
          alt="Preview"
          width={192}
          height={192}
          className="w-48 h-48 object-cover rounded-lg border border-zinc-700"
        />
      )}
    </div>
  );
}

function SpecificationsTab({ 
  formData, 
  updateField,
  disabled 
}: {
  formData: Partial<Product>;
  updateField: (field: keyof Product, value: unknown) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {SPEC_FIELDS.map((field) => (
        <InputField
          key={field}
          label={field.toUpperCase()}
          value={String(formData[field as keyof Product] ?? "")}
          onChange={(value) => updateField(field as keyof Product, value)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function MarketingTab({ 
  formData, 
  updateField,
  disabled 
}: {
  formData: Partial<Product>;
  updateField: (field: keyof Product, value: unknown) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.is_promo || false}
          onChange={(e) => updateField("is_promo", e.target.checked)}
          className="w-4 h-4"
          disabled={disabled}
        />
        Mark as Promo Product
      </label>
    </div>
  );
}

function FormActions({ 
  isEditing, 
  onCancel,
  isLoading 
}: {
  isEditing: boolean;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-50"
        disabled={isLoading}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            {isEditing ? "Saving..." : "Adding..."}
          </>
        ) : (
          <>{isEditing ? "Save Changes" : "Add Product"}</>
        )}
      </button>
    </div>
  );
}

// Reusable Input Components

function InputField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && "*"}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  label: string;
  value?: number;
  onChange: (value: number) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && "*"}
      </label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white disabled:opacity-50"
        required={required}
        disabled={disabled}
      />
    </div>
  );
}