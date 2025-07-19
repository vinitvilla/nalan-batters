import { ReactNode } from 'react';
import { userStore } from '@/store/userStore';
import { hasPermission, Permission } from '@/lib/permissions';

interface RequirePermissionProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { userRole } = userStore();
  
  if (!hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { userRole } = userStore();
  
  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
