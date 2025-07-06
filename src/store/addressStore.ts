import { create } from 'zustand';
import { toast } from "sonner";

export interface AddressFields {
  street: string;
  unit: string;
  city: string;
  province: string;
  country: string;
  postal: string;
  id?: string;
}

interface AddressState {
  addresses: AddressFields[];
  selectedAddress: AddressFields | null;
  newAddress: AddressFields;
  setAddresses: (addresses: AddressFields[]) => void;
  setSelectedAddress: (addr: AddressFields | null) => void;
  setNewAddress: (addr: AddressFields) => void;
  addAddress: (addr: AddressFields) => void;
  clearNewAddress: () => void;
  removeAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set) => ({
  addresses: [],
  selectedAddress: null,
  newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' },
  setAddresses: (addresses) => set({ addresses }),
  setSelectedAddress: (addr) => set({ selectedAddress: addr }),
  setNewAddress: (addr) => set({ newAddress: addr }),
  addAddress: (addr) => set((state) => ({ addresses: [...state.addresses, addr], selectedAddress: addr })),
  clearNewAddress: () => set({ newAddress: { street: '', unit: '', city: '', province: '', country: '', postal: '' } }),
  removeAddress: async (id: string) => {
    if (!id) {
      toast.error?.("Invalid address ID, Please try again later.");
      return;
    }
    try {
      const res = await fetch(`/api/public/addresses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete address');
      set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        selectedAddress: state.selectedAddress?.id === id ? null : state.selectedAddress
      }));
    } catch (err) {
      toast.error?.("Failed to delete address. Please try again.");
      console.error(err);
    }
  }
    

}));
