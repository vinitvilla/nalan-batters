import { useRouter } from "next/navigation";
import { userStore } from "@/store/userStore";

/**
 * Centralized admin API hook: fetches and redirects to /signin on 401 Unauthorized or forbidden.
 * Usage: await adminApiFetch("/api/admin/products", { ... })
 */
export function useAdminApi() {
  const router = useRouter();
  const token = userStore((s) => s.token);

  async function adminApiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | undefined> {
    if (!token) {
      router.push("/signin");
      return;
    }
    const headers = new Headers(init.headers || {});
    headers.set("Authorization", `Bearer ${token}`);
    try {
      const res = await fetch(input, { ...init, headers });
      if (res.status === 401) {
        router.push("/signin");
        return;
      }
      if (res.status === 403) {
        router.push("/"); // forbidden, not admin
        return;
      }
      return res;
    } catch (err) {
      throw err;
    }
  }

  return adminApiFetch;
}
