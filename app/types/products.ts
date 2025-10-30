export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  barcode: string;
  brand: string;
  price: number;
  discount?: number;
  warranty_months: number;
  original_price?: number;
  category_id: number;
  category?: Category;
  created_at?: string;
  updated_at?: string;
  image_url: string;
  old_price?: number;
  is_promo?: boolean;
  etat: "Neuf" | "Excellent" | "Tres Bon" | "Bon" | "Acceptable";
  garantie?: string;
  retour?: string;
  cpu?: string;
  ram?: string;
  storage?: string;
  screen?: string;
  battery?: string;
  camera?: string;
  refroidissement?: string;
  système?: string;
  gpu?: string;
  alimentation?: string;
  boîtier?: string;
  number_sold?: number;
}

export type TabType =
  | "basic"
  | "pricing"
  | "inventory"
  | "images"
  | "specifications"
  | "marketing";
