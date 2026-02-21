import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase/firebase";
import { userStore } from "@/store/userStore";
import { hydrateUserFromApi } from "@/lib/hydrateUserFromApi";
import { useUserRole } from "./useUserRole";

export function useAdminAuth() {
  const { setUser, setLoading, user, loading } = userStore();
  const { isAdmin, isManager, hasAdminAccess, userRole } = useUserRole();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await hydrateUserFromApi();
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return { user, isAdmin, isManager, hasAdminAccess, userRole, loading };
}
