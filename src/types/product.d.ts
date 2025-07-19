// Product types based on Prisma model
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product for API responses
export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  category?: CategoryResponse;
}

// Product with category relationship
export interface ProductWithCategory extends Product {
  category: Category | null;
}

// Product creation/update types
export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  imageUrl?: string;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
