import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock?: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface ProductStore {
  products: Product[];
  setProducts: (products: Product[]) => void;
  fetchProducts: () => Promise<void>;
  upsertProduct: (product: Partial<Product>, token?: string) => Promise<void>;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchCategories: (token?: string) => Promise<void>;
}

export const useProductStore = create(
  devtools<ProductStore>((set) => ({
    products: [],
    setProducts: (products) => set({ products }),
    fetchProducts: async () => {
      const res = await fetch("/api/public/products", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        set({ products: data });
      }
    },
    upsertProduct: async (product, token) => {
      try {
        const method = product.id ? "PUT" : "POST";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        
        const res = await fetch("/api/admin/products", {
          method,
          headers,
          credentials: "include",
          body: JSON.stringify(product),
        });
        
        if (!res.ok) {
          const errorData = await res.text();
          throw new Error(`Failed to save product: ${res.status} ${errorData}`);
        }
        
        const updatedProduct = await res.json();
        
        set((state) => ({
          products: state.products.some(p => p.id === updatedProduct.id)
            ? state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            : [updatedProduct, ...state.products],
        }));
      } catch (error) {
        console.error('Store: upsertProduct error:', error);
        throw error;
      }
    },
    categories: [],
    setCategories: (categories) => set({ categories }),
    fetchCategories: async (token) => {
      const res = await fetch("/api/admin/categories", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        set({ categories: Array.isArray(data) ? data : data.categories || [] });
      }
    },
  }), { name: "ProductStore" })
);
