import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase/firebase";
import { userStore } from "@/store/userStore";
import { hydrateUserFromApi } from "@/lib/hydrateUserFromApi";

export function useAdminAuth() {
  const { setUser, setIsAdmin, setLoading, user, isAdmin, isManager, hasAdminAccess, userRole, loading } = userStore();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await hydrateUserFromApi();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  return { user, isAdmin, isManager, hasAdminAccess, userRole, loading };
}
