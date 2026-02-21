import { USER_ROLE } from "@/constants/userRole";

export type Permission = 
  | 'dashboard'
  | 'billing'
  | 'orders'
  | 'users'
  | 'promo-codes'
  | 'contact-messages'
  | 'delivery'
  | 'products'
  | 'feature-flags'
  | 'settings';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [USER_ROLE.ADMIN]: [
    'dashboard',
    'billing',
    'orders',
    'users',
    'promo-codes', 
    'contact-messages',
    'delivery',
    'products',
    'feature-flags',
    'settings'
  ],
  [USER_ROLE.MANAGER]: [
    'billing',
    'orders',
    'users',
    'promo-codes'
  ],
  [USER_ROLE.DRIVER]: [
    'orders',
    'delivery'
  ],
  [USER_ROLE.USER]: []
};

export function hasPermission(userRole: string | null, permission: Permission): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function getUserPermissions(userRole: string | null): Permission[] {
  if (!userRole) return [];
  return ROLE_PERMISSIONS[userRole] || [];
}

export function getDefaultRoute(userRole: string | null): string {
  if (userRole === USER_ROLE.ADMIN) return '/admin/dashboard';
  if (userRole === USER_ROLE.MANAGER) return '/admin/billing-pos';
  return '/';
}
