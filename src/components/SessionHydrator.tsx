"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignOut } from "@/hooks/useSignOut";
import { hydrateUserFromApi } from "@/lib/hydrateUserFromApi";

export function SessionHydrator() {
  const router = useRouter();
  const signOut = useSignOut();

  useEffect(() => {
    let token = localStorage.getItem("auth-token");
    if (!token) {
      const match = document.cookie.match(/(?:^|; )auth-token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }
    if (token) {
      hydrateUserFromApi({
        token,
        onUnauthorized: () => {
          signOut({ showToast: false });
          router.push("/");
        },
      });
    }
  }, [router, signOut]);

  return null;
}
