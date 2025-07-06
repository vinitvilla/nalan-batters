"use client";
import { useEffect } from "react";
import { userStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useAddressStore } from "@/store/addressStore";

export function SessionHydrator() {
  const router = useRouter();
  useEffect(() => {
    let token = localStorage.getItem("auth-token");
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth-token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      userStore.getState().setToken(token);
      fetch("/api/public/me", { credentials: "include" })
        .then(res => {
          if (res.status === 401) {
            userStore.getState().signOut();
            router.push("/");
          }
          return res.json();
        })
        .then(data => {
          if (data.user) {
            userStore.getState().setUser(data.user);
            if (data.user.addresses) {
              useAddressStore.getState().setAddresses(data.user.addresses);
            }
            if (data.user.defaultAddress) {
              useAddressStore.getState().setSelectedAddress(data.user.defaultAddress);
            }
          }
        })
        .catch(() => {
          userStore.getState().signOut();
          router.push("/");
        });
    }
  }, [router]);
  return null;
}
