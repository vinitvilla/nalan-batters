import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { USER_ROLE } from "@/constants/userRole";

export async function hydrateUserFromApi({
  token,
  onUnauthorized,
}: {
  token?: string;
  onUnauthorized?: () => void;
} = {}) {
  if (token) {
    userStore.getState().setToken(token);
  }
  try {
    const res = await fetch("/api/public/me", { credentials: "include" });

    if (res.status === 401) {
      onUnauthorized && onUnauthorized();
      return;
    }
    const data = await res.json();
    if (data.user) {
      userStore.getState().setUser(data.user);
      userStore.getState().setIsAdmin?.(data.user.role === USER_ROLE.ADMIN);
      if (data.user.addresses) {
        useAddressStore.getState().setAddresses(data.user.addresses);
      }
      if (data.user.defaultAddress) {
        useAddressStore.getState().setSelectedAddress(data.user.defaultAddress);
      }
      if (data.user.id) {
        await useCartStore.getState().fetchAndMergeCart();
      }
    }
  } catch {
    onUnauthorized && onUnauthorized();
  }
}
