import { useState, useEffect } from 'react';

interface BillingMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  refundsIssued: number;
  averageOrderValue: number;
  totalOrders: number;
}

interface UseBillingDataReturn {
  metrics: BillingMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function useBillingData(): UseBillingDataReturn {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/billing');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        setError(data.error || 'Failed to fetch billing data');
      }
    } catch (err) {
      setError('Network error while fetching billing data');
      console.error('Billing data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchBillingData();
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  return {
    metrics,
    loading,
    error,
    refreshData
  };
}
