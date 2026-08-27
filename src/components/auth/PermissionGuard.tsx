import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ForbiddenPage } from '../../features/auth/pages/ForbiddenPage';
import type { UserRole } from '../../types/auth';

interface PermissionGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  requiredPermission?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  allowedRoles,
  children,
  requiredPermission,
}) => {
  const { user, membership } = useAuth();
  const currentRole = user?.role || 'gvcn';

  // 1. Kiểm tra Role
  const hasRole = allowedRoles.includes(currentRole);

  // 2. Kiểm tra Permission cụ thể (nếu có)
  let hasSpecificPermission = true;
  if (requiredPermission && membership?.permissions) {
    hasSpecificPermission = Boolean(membership.permissions[requiredPermission]);
  }

  if (!hasRole || !hasSpecificPermission) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};
