/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CartDropdown from './CartDropdown';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useConfigStore } from '@/store/configStore';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock stores
vi.mock('@/store/cartStore');
vi.mock('@/store/orderStore');
vi.mock('@/store/configStore');

describe('CartDropdown', () => {
  const mockOnClose = vi.fn();
  const mockAnchorRef = { current: null };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mocks
    (useConfigStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({ configs: { taxPercent: { percent: 13 } } })
    );

    (useOrderStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        promo: { code: '', applied: false },
        setPromo: vi.fn(),
        clearPromo: vi.fn(),
        applyPromo: vi.fn(),
        getOrderCalculations: vi.fn().mockReturnValue({
          subtotal: 20,
          tax: 2.6,
          convenienceCharge: 0,
          deliveryCharge: 0,
          appliedDiscount: 0,
          finalTotal: 22.6,
          originalTax: 2.6,
          originalConvenienceCharge: 0,
          originalDeliveryCharge: 0,
          isTaxWaived: false,
          isConvenienceWaived: false,
          isDeliveryWaived: false
        })
      };
      return selector(state);
    });
  });

  it('renders empty cart message when no items', () => {
    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        items: [],
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        isCartOpen: true
      })
    );

    render(<CartDropdown open={true} onClose={mockOnClose} anchorRef={mockAnchorRef} />);
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('renders cart items correctly', () => {
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 2 }
    ];

    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        items: mockItems,
        updateQuantity: vi.fn(),
        removeFromCart: vi.fn(),
        isCartOpen: true
      })
    );

    render(<CartDropdown open={true} onClose={mockOnClose} anchorRef={mockAnchorRef} />);
    expect(screen.getByText('Dosa Batter')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    const prices = screen.getAllByText('$20.00');
    expect(prices.length).toBeGreaterThan(0); // Should appear at least once (item total)
  });

  it('calls removeFromCart when trash icon is clicked', () => {
    const mockRemove = vi.fn();
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 1 }
    ];

    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        items: mockItems,
        updateQuantity: vi.fn(),
        removeFromCart: mockRemove,
        isCartOpen: true
      })
    );

    render(<CartDropdown open={true} onClose={mockOnClose} anchorRef={mockAnchorRef} />);
    const deleteBtn = screen.getByLabelText('Remove Dosa Batter from cart');
    fireEvent.click(deleteBtn);
    expect(mockRemove).toHaveBeenCalledWith('1');
  });

  it('calls updateQuantity when input changes', () => {
    const mockUpdate = vi.fn();
    const mockItems = [
      { id: '1', name: 'Dosa Batter', price: 10, quantity: 1 }
    ];

    (useCartStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        items: mockItems,
        updateQuantity: mockUpdate,
        removeFromCart: vi.fn(),
        isCartOpen: true
      })
    );

    render(<CartDropdown open={true} onClose={mockOnClose} anchorRef={mockAnchorRef} />);
    const input = screen.getByLabelText('Quantity for Dosa Batter');
    fireEvent.change(input, { target: { value: '3' } });
    expect(mockUpdate).toHaveBeenCalledWith('1', 3);
  });
});
