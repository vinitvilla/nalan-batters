import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddressForm } from './AddressForm';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAddressStore } from '@/store/addressStore';

// Mock store
vi.mock('@/store/addressStore');

describe('AddressForm', () => {
  const mockOnAdd = vi.fn();
  const mockOnCancel = vi.fn();
  const mockSetNewAddress = vi.fn();
  const mockClearNewAddress = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      };
      return selector(state);
    });

    // Mock Google Maps
    global.window.google = {
      maps: {
        places: {
          Autocomplete: vi.fn().mockImplementation(() => ({
            addListener: vi.fn(),
            getPlace: vi.fn(),
          })),
        },
      },
    } as any;
  });

  afterEach(() => {
    delete (global.window as any).google;
  });

  it('renders form fields correctly', () => {
    // Override store to return populated address for rendering check
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
      const state = {
        newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      };
      return selector(state);
    });

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    // Since fields are conditional on newAddress being present (which it is in default mock state logic in component?)
    // Actually looking at component: 
    // const newAddress = useAddressStore((s) => s.newAddress);
    // ...
    // {newAddress && ( ... fields ... )}
    // So we need to make sure newAddress is truthy in the store mock.

    // Let's re-mock with a truthy object
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    expect(screen.getAllByPlaceholderText('123 Main Street')[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Toronto')[0]).toBeInTheDocument();
  });

  it('validates required fields on save', () => {
    // Mock empty address
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Address'));

    expect(screen.getByText(/All required fields must be filled/)).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('validates Canadian postal code', () => {
    // Mock address with invalid postal code
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: {
          street: '123 Main St',
          unit: '',
          city: 'Toronto',
          province: 'ON',
          country: 'Canada',
          postal: '12345' // Invalid
        },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Address'));

    expect(screen.getByText(/Invalid Canadian postal code format/)).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('validates Province is Ontario', () => {
    // Mock address with wrong province
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: {
          street: '123 Main St',
          unit: '',
          city: 'Vancouver',
          province: 'BC',
          country: 'Canada',
          postal: 'V6B 1A1'
        },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Address'));

    expect(screen.getByText(/Province must be Ontario/)).toBeInTheDocument();
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd when form is valid', () => {
    // Mock valid address
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: {
          street: '123 Main St',
          unit: '',
          city: 'Toronto',
          province: 'ON',
          country: 'Canada',
          postal: 'M5V 2T6'
        },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Save Address'));

    expect(mockOnAdd).toHaveBeenCalled();
    expect(mockClearNewAddress).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    (useAddressStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
      selector({
        newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
        setNewAddress: mockSetNewAddress,
        clearNewAddress: mockClearNewAddress
      })
    );

    render(<AddressForm onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockClearNewAddress).toHaveBeenCalled();
  });
});
