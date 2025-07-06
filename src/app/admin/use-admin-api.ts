import { useRouter } from "next/navigation";

/**
 * Centralized admin API hook: fetches and redirects to /signin on 401 Unauthorized.
 * Usage: await adminApiFetch("/api/admin/products", { ... })
 */
export function useAdminApi() {
  const router = useRouter();

  async function adminApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response | undefined> {
    try {
      const res = await fetch(input, init);
      if (res.status === 401) {
        router.push("/signin");
        return;
      }
      return res;
    } catch (err) {
      throw err;
    }
  }

  return adminApiFetch;
}
