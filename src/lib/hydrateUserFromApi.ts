import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { useConfigStore } from "@/store/configStore";

type CartItemFromApi = {
  product: { id: string; name: string; price: number; image?: string | null };
  quantity: number;
};

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

    if (res.status === 401 || res.status === 403 || res.status === 404) {
      if (onUnauthorized) onUnauthorized();
      return;
    }
    const data = await res.json();
    if (data.user) {
      userStore.getState().setUser(data.user);
      if (data.user.addresses) {
        useAddressStore.getState().setAddresses(data.user.addresses);
      }
      if (data.user.defaultAddress) {
        useAddressStore.getState().setSelectedAddress(data.user.defaultAddress);
      }
      if (data.user.cart) {
        useCartStore.getState().setCartItems(
          data.user.cart.items.map((item: CartItemFromApi) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          }))
        );
      }
      useConfigStore.getState().loadAllConfigs();
    }
  } catch {
    if (onUnauthorized) onUnauthorized();
  }
}
