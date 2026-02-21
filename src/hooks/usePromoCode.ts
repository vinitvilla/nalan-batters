import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';

/**
 * Custom hook for promo code application
 * Handles validation, application, and error states
 */
export function usePromoCode() {
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState(false);

  const promo = useOrderStore(s => s.promo);
  const applyPromo = useOrderStore(s => s.applyPromo);
  const clearPromo = useOrderStore(s => s.clearPromo);

  const handleApplyPromo = async (code: string) => {
    if (!code.trim()) {
      setPromoError(true);
      return false;
    }

    setApplyingPromo(true);
    setPromoError(false);

    try {
      const result = await applyPromo(code);
      if (!result.success) {
        setPromoError(true);
        return false;
      }
      return true;
    } catch {
      setPromoError(true);
      return false;
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleClearPromo = () => {
    clearPromo();
    setPromoError(false);
  };

  return {
    promo,
    applyingPromo,
    promoError,
    applyPromo: handleApplyPromo,
    clearPromo: handleClearPromo,
  };
}
