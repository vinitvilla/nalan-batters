import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserPhoneStep } from './UserPhoneStep';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userStore } from '@/store/userStore';
import { signInWithPhoneNumber } from 'firebase/auth';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  RecaptchaVerifier: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    clear: vi.fn(),
  })),
  signInWithPhoneNumber: vi.fn(),
}));

vi.mock('@/lib/firebase/firebase', () => ({
  auth: {},
}));

// Mock store
vi.mock('@/store/userStore');

describe('UserPhoneStep', () => {
  const mockOnOtpSent = vi.fn();
  const mockSetPhone = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (userStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        phone: '',
        setPhone: mockSetPhone,
      })
    );

    // Mock window.recaptchaVerifier
    (window as any).recaptchaVerifier = {
      render: vi.fn(),
      clear: vi.fn(),
    };
  });

  it('renders phone input field', () => {
    render(<UserPhoneStep onOtpSent={mockOnOtpSent} />);
    expect(screen.getByPlaceholderText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Continue with Phone Number')).toBeInTheDocument();
  });

  it('calls signInWithPhoneNumber on submit', async () => {
    const mockConfirmationResult = { verificationId: '123' };
    (signInWithPhoneNumber as any).mockResolvedValue(mockConfirmationResult);

    // Mock store state for phone
    (userStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        phone: '+15551234567',
        setPhone: mockSetPhone,
      })
    );

    render(<UserPhoneStep onOtpSent={mockOnOtpSent} />);

    const form = screen.getByRole('button', { name: /Continue with Phone Number/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(signInWithPhoneNumber).toHaveBeenCalled();
      expect(mockOnOtpSent).toHaveBeenCalledWith(mockConfirmationResult);
    });
  });

  it('handles Firebase errors gracefully', async () => {
    (signInWithPhoneNumber as any).mockRejectedValue(new Error('Firebase Error'));

    // Mock store state for phone
    (userStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        phone: '+15551234567',
        setPhone: mockSetPhone,
      })
    );

    render(<UserPhoneStep onOtpSent={mockOnOtpSent} />);

    const form = screen.getByRole('button', { name: /Continue with Phone Number/i }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText('Firebase Error')).toBeInTheDocument();
      expect(mockOnOtpSent).not.toHaveBeenCalled();
    });
  });
});
