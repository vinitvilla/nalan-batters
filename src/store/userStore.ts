import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserResponse } from "@/types/user";
import type { AddressFields } from "@/store/addressStore";
import { formatPhoneNumber } from "@/services/user/phoneFormatter.service";

interface UserState {
  id: string | null;
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  defaultAddress: AddressFields | null;
  // Computed properties for convenience (derived from user)
  phone: string;
  fullName: string;
  setId: (id: string) => void;
  setUser: (user: UserResponse | null) => void;
  setToken: (token: string | null) => void;
  setPhone: (phone: string) => void;
  setLoading: (loading: boolean) => void;
  setDefaultAddress: (address: AddressFields | null) => void;
  reset: () => void;
}

export const userStore = create(
  devtools<UserState>(
    (set) => ({
      id: null,
      user: null,
      token: null,
      loading: true,
      defaultAddress: null,
      phone: "",
      fullName: "",
      setUser: (user) => {
        set(() => ({
          user,
          id: user?.id,
          phone: user?.phone ? formatPhoneNumber(user.phone) : "",
          fullName: user?.fullName || "",
          // Keep existing defaultAddress, it's managed separately
        }));
      },
      setToken: (token) => {
        set({ token });
        if (typeof window !== "undefined") {
          if (token) {
            // Set cookie (expires in 12 hours)
            document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 12}`;
            localStorage.setItem("auth-token", token);
          } else {
            document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            localStorage.removeItem("auth-token");
          }
        }
      },
      setId: (id: string) => set({ id }),
      setPhone: (phone: string) => set({ phone: formatPhoneNumber(phone) }),
      setLoading: (loading: boolean) => set({ loading }),
      setDefaultAddress: (address) => set({ defaultAddress: address }),
      reset: () => set({
        id: null,
        user: null,
        token: null,
        phone: "",
        fullName: "",
        loading: false
      }),
    }),
    { name: "UserStore" }
  )
);
