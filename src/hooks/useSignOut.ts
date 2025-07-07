import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";
import { useAddressStore } from "@/store/addressStore";
import { useCartStore } from "@/store/cartStore";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { toast } from "sonner";
import { debug } from "console";

export function useSignOut() {
  const router = useRouter();

  return useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      toast.error("Error signing out. Please try again.");
    }
    userStore.getState().reset();
    useAddressStore.getState().setAddresses([]);
    useAddressStore.getState().setSelectedAddress(null);
    useAddressStore.getState().clearNewAddress();
    useCartStore.getState().clearCart();
    if (typeof window !== "undefined") {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.removeItem("auth-token");
    }
    toast.success("You have been signed out successfully.");
    router.push("/");
  }, [router]);
}
