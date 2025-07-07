import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { UserType } from "@/types/UserType";

interface UserState {
  id: string | null;
  user: UserType | null;
  token: string | null;
  fullName: string;
  phone: string;
  isAdmin: boolean;
  loading: boolean;
  setId: (id: string) => void;
  setUser: (user: UserType | null) => void;
  setToken: (token: string | null) => void;
  setFullName: (name: string) => void;
  setPhone: (phone: string) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const userStore = create(
  devtools<UserState>(
    (set) => ({
      id: null,
      user: null,
      token: null,
      fullName: "",
      phone: "",
      isAdmin: false,
      loading: true,
      setUser: (user) => {
        set((state) => ({
          user,
          id: user?.id,
          fullName: user?.fullName || "",
          phone: user?.phone ? (user.phone.startsWith("+1") ? user.phone : "+1" + user.phone.replace(/^\+?1?/, "")) : "",
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
      setFullName: (fullName: string) => set({ fullName }),
      setPhone: (phone: string) => set({ phone: phone.startsWith("+1") ? phone : "+1" + phone.replace(/^\+?1?/, "") }),
      setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
      setLoading: (loading: boolean) => set({ loading }),
      reset: () => set({ id: null, user: null, token: null, fullName: "", phone: "", isAdmin: false, loading: false }),
    }),
    { name: "UserStore" }
  )
);
