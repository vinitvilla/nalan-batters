/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderSummary } from './OrderSummary';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useConfigStore } from '@/store/configStore';
import { userStore } from '@/store/userStore';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock stores
vi.mock('@/store/cartStore');
vi.mock('@/store/orderStore');
vi.mock('@/store/configStore');
vi.mock('@/store/userStore');

// Mock hooks
const mockPlaceOrder = vi.fn().mockResolvedValue(true);
const mockGetOrderValidationMessage = vi.fn().mockImplementation(
  (_items: unknown[], address: unknown) => address ? null : 'Please select a delivery address'
);
vi.mock('@/hooks/useOrderPlacement', () => ({
  useOrderPlacement: () => ({
    placing: false,
    orderError: '',
    getOrderValidationMessage: mockGetOrderValidationMessage,
    placeOrder: mockPlaceOrder,
  }),
}));

vi.mock('@/hooks/usePromoCode', () => ({
  usePromoCode: () => ({
    promo: { code: '', applied: false },
    applyingPromo: false,
    promoError: '',
    applyPromo: vi.fn(),
    clearPromo: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('OrderSummary', () => {
  const mockRemove = vi.fn();
  const mockUpdate = vi.fn();
  const mockAddress = {
    id: 'addr1',
    street: '123 Main St',
    unit: 'Apt 4B',
    city: 'Toronto',
    province: 'ON',
    country: 'Canada',
    postal: 'M5V 2T6'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mocks
    (useConfigStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        configs: {
          taxPercent: { percent: 13 },
          freeDelivery: {
            Sunday: ['Toronto'],
            Monday: ['Toronto'],
            Tuesday: ['Toronto'],
            Wednesday: ['Toronto'],
            Thursday: ['Toronto'],
            Friday: ['Toronto'],
            Saturday: ['Toronto']
          }
        }
      })
    );

    (userStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({ user: { id: 'user1' } })
    );

    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        selectedDeliveryDate: '2023-12-25',
        deliveryType: 'DELIVERY',
        setDeliveryType: vi.fn(),
        promo: { code: '', applied: false },
        setPromo: vi.fn(),
        clearPromo: vi.fn(),
        applyPromo: vi.fn(),
        getOrderCalculations: vi.fn().mockReturnValue({
          subtotal: 20,
          tax: 2.6,
          convenienceCharge: 0,
          deliveryCharge: 5,
          appliedDiscount: 0,
          finalTotal: 27.6,
          originalTax: 2.6,
          originalConvenienceCharge: 0,
          originalDeliveryCharge: 5,
          isTaxWaived: false,
          isConvenienceWaived: false,
          isDeliveryWaived: false
        })
      };
      return selector(state);
    });

    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      clearCart: vi.fn()
    });
    (useCartStore as unknown as any).getState = vi.fn().mockReturnValue({
      clearCart: vi.fn()
    });
  });

  it('renders order details correctly', () => {
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 2 }
    ];

    render(
      <OrderSummary
        cartItems={mockItems}
        removeFromCart={mockRemove}
        selectedAddress={mockAddress}
        updateQuantity={mockUpdate}
        total={27.6}
      />
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Dosa Batter')).toBeInTheDocument();
    expect(screen.getByText('$27.60')).toBeInTheDocument(); // Total
  });

  it('shows validation error if address is missing for delivery', () => {
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 1 }
    ];

    render(
      <OrderSummary
        cartItems={mockItems}
        removeFromCart={mockRemove}
        selectedAddress={null} // No address
        updateQuantity={mockUpdate}
        total={15}
      />
    );

    expect(screen.getByText('Please select a delivery address')).toBeInTheDocument();
    expect(screen.getByText('Place Order')).toBeDisabled();
  });

  it('calls handlePlaceOrder when Place Order is clicked', async () => {
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 1 }
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ order: { orderNumber: 'ORD-123' } })
    });

    render(
      <OrderSummary
        cartItems={mockItems}
        removeFromCart={mockRemove}
        selectedAddress={mockAddress}
        updateQuantity={mockUpdate}
        total={27.6}
      />
    );

    const placeOrderBtn = screen.getByText('Place Order');
    expect(placeOrderBtn).not.toBeDisabled();

    fireEvent.click(placeOrderBtn);

    await waitFor(() => {
      expect(mockPlaceOrder).toHaveBeenCalled();
    });
  });
});
