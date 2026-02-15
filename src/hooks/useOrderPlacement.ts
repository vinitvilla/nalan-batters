import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { userStore } from '@/store/userStore';
import { useOrderStore } from '@/store/orderStore';
import type { AddressFields } from '@/store/addressStore';
import type { CartItem } from '@/types/cart';
import type { Config } from '@/types/config';
import { getNextAvailableDeliveryDates } from '@/services/order/delivery.service';

/**
 * Custom hook for order placement
 * Handles validation, submission, and navigation
 */
export function useOrderPlacement() {
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const clearCart = useCartStore(s => s.clearCart);
  const user = userStore(s => s.user);
  const deliveryType = useOrderStore(s => s.deliveryType);
  const selectedDeliveryDate = useOrderStore(s => s.selectedDeliveryDate);
  const promo = useOrderStore(s => s.promo);

  const getOrderValidationMessage = (
    cartItems: CartItem[],
    selectedAddress: AddressFields | null,
    config?: Config
  ): string | null => {
    if (cartItems.length === 0) return "Your cart is empty";
    if (deliveryType === 'DELIVERY' && !selectedAddress) return "Please select a delivery address";
    if (deliveryType === 'DELIVERY' && !selectedDeliveryDate) return "Please select a delivery date";

    // Check if delivery is available for the selected address
    if (deliveryType === 'DELIVERY' && selectedAddress && config?.freeDelivery) {
      const deliveryDates = getNextAvailableDeliveryDates(
        selectedAddress.city || '',
        config.freeDelivery,
        4
      );
      if (deliveryDates.length === 0) {
        return "Delivery is not available for this location";
      }
    }

    return null;
  };

  const placeOrder = async (
    cartItems: CartItem[],
    selectedAddress: AddressFields | null
  ): Promise<boolean> => {
    setPlacing(true);
    setOrderError("");

    try {
      const res = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          addressId: selectedAddress?.id,
          items: cartItems.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price
          })),
          promoCodeId: promo.applied && promo.id ? promo.id : null,
          deliveryDate: selectedDeliveryDate,
          orderType: 'ONLINE', // This is an online order from the website
          deliveryType: deliveryType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.order) {
        throw new Error(data.error || "Failed to place order");
      }

      // Clear cart and navigate to success page
      clearCart();
      router.push("/order-success");
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      setOrderError(message);
      return false;
    } finally {
      setPlacing(false);
    }
  };

  return {
    placing,
    orderError,
    getOrderValidationMessage,
    placeOrder,
  };
}
