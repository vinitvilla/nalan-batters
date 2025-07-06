import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase/firebase";
import { userStore } from "@/store/userStore";

export function useAdminAuth() {
  const { setUser, setIsAdmin, setLoading, user, isAdmin, loading } = userStore();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, [setUser, setIsAdmin, setLoading]);

  return { user, isAdmin, loading };
}
