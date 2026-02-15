import { userStore } from "@/store/userStore";
import { USER_ROLE } from "@/constants/userRole";

/**
 * Hook to get user role and permissions
 * Computes derived properties from user state
 */
export function useUserRole() {
  const user = userStore((state) => state.user);
  const userRole = user?.role || null;
  const isAdmin = userRole === USER_ROLE.ADMIN;
  const isManager = userRole === USER_ROLE.MANAGER;
  const hasAdminAccess = isAdmin || isManager;

  return {
    userRole,
    isAdmin,
    isManager,
    hasAdminAccess,
  };
}
