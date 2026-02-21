import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
  category: Category;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'VALUE';
  description?: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  currentUsage: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PosConfig {
  taxRate: number;
  taxWaived: boolean;
  convenienceCharge: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

interface PosData {
  products: Product[];
  categories: Category[];
  config: PosConfig;
  promoCodes: PromoCode[];
}

interface UsePosDataReturn {
  data: PosData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePosData(): UsePosDataReturn {
  const [data, setData] = useState<PosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/pos');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch POS data');
      }
    } catch (err) {
      setError('Network error while fetching POS data');
      console.error('POS data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchPosData();
  };

  useEffect(() => {
    fetchPosData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch
  };
}
