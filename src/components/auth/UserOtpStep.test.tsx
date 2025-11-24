import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserOtpStep } from './UserOtpStep';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userStore } from '@/store/userStore';
import { useAddressStore } from '@/store/addressStore';
import { useCartStore } from '@/store/cartStore';

// Mock stores
vi.mock('@/store/userStore');
vi.mock('@/store/addressStore');
vi.mock('@/store/cartStore');

// Mock fetch
global.fetch = vi.fn();

describe('UserOtpStep', () => {
  const mockOnUserFound = vi.fn();
  const mockOnUserNotFound = vi.fn();
  const mockOnBack = vi.fn();
  const mockConfirm = vi.fn();
  const mockConfirmationResult = {
    confirm: mockConfirm,
  } as any;

  const mockSetUser = vi.fn();
  const mockSetId = vi.fn();
  const mockSetToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (userStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        phone: '+15551234567',
        setUser: mockSetUser,
        setId: mockSetId,
        setToken: mockSetToken,
      })
    );

    (useAddressStore as unknown as any).getState = vi.fn().mockReturnValue({
      setAddresses: vi.fn(),
      setSelectedAddress: vi.fn(),
    });

    (useCartStore as unknown as any).getState = vi.fn().mockReturnValue({
      setCartItems: vi.fn(),
    });

    (userStore as unknown as any).getState = vi.fn().mockReturnValue({
      setUser: mockSetUser,
      setId: mockSetId,
      setToken: mockSetToken,
      setIsAdmin: vi.fn(),
    });
  });

  it('renders OTP input slots', () => {
    render(
      <UserOtpStep
        onUserFound={mockOnUserFound}
        onUserNotFound={mockOnUserNotFound}
        onBack={mockOnBack}
        confirmationResult={mockConfirmationResult}
      />
    );

    // Check for 6 OTP slots
    const slots = document.querySelectorAll('.border-gray-200');
    // Note: InputOTP renders multiple slots. We can check for the label or container.
    expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
  });

  it('calls confirmationResult.confirm on verify', async () => {
    mockConfirm.mockResolvedValue({
      user: { uid: 'firebase-uid', getIdToken: vi.fn().mockResolvedValue('token-123') }
    });

    // Mock user not found in DB
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: null })
    });

    render(
      <UserOtpStep
        onUserFound={mockOnUserFound}
        onUserNotFound={mockOnUserNotFound}
        onBack={mockOnBack}
        confirmationResult={mockConfirmationResult}
      />
    );

    // Simulate entering OTP
    const inputs = screen.getAllByRole('textbox');
    // InputOTP might be tricky to simulate typing directly into slots, 
    // but usually it has a hidden input or handles paste/type.
    // Let's try finding the hidden input if it exists, or just firing change on the first input if accessible.
    // Actually, the component uses `InputOTP` which might expose a single input or handle events differently.
    // A simpler way for this test might be to mock the `InputOTP` component if it's complex, 
    // OR assume the `onChange` prop is wired up.

    // However, we can try to fire change event on the hidden input if we can find it.
    // Alternatively, we can just manually set the state if we could, but we can't access internal state.

    // Let's try to find the input by role 'textbox' which usually InputOTP renders.
    const hiddenInput = screen.getByRole('textbox');
    fireEvent.change(hiddenInput, { target: { value: '123456' } });

    const form = screen.getByRole('button', { name: /Verify & Continue/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith('123456');
      expect(mockOnUserNotFound).toHaveBeenCalled();
    });
  });

  it('fetches user data and hydrates stores if user exists', async () => {
    mockConfirm.mockResolvedValue({
      user: { uid: 'firebase-uid', getIdToken: vi.fn().mockResolvedValue('token-123') }
    });

    const mockUser = { id: 'db-user-id', name: 'John', addresses: [], role: 'USER' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser })
    });

    render(
      <UserOtpStep
        onUserFound={mockOnUserFound}
        onUserNotFound={mockOnUserNotFound}
        onBack={mockOnBack}
        confirmationResult={mockConfirmationResult}
      />
    );

    const hiddenInput = screen.getByRole('textbox');
    fireEvent.change(hiddenInput, { target: { value: '123456' } });

    const form = screen.getByRole('button', { name: /Verify & Continue/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockOnUserFound).toHaveBeenCalledWith(mockUser);
    });
  });
});
