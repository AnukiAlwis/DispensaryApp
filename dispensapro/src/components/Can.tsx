import React from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '../hooks/usePermissions';

interface CanProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
}

/**
 * Component for conditional rendering based on user permissions
 * 
 * @example
 * // Single permission check
 * <Can permission="PATIENT_EDIT">
 *   <EditButton />
 * </Can>
 * 
 * @example
 * // Any of multiple permissions
 * <Can permissions={["PATIENT_EDIT", "USER_MANAGE"]} mode="any">
 *   <AdminButton />
 * </Can>
 * 
 * @example
 * // All of multiple permissions
 * <Can permissions={["PATIENT_VIEW", "PATIENT_EDIT"]} mode="all">
 *   <FullPatientAccess />
 * </Can>
 * 
 * @example
 * // With custom fallback
 * <Can permission="PATIENT_EDIT" fallback={<LockedIcon />}>
 *   <EditButton />
 * </Can>
 */
export const Can: React.FC<CanProps> = ({
  children,
  permission,
  permissions,
  mode = 'any',
  fallback = null,
}) => {
  // Call all hooks unconditionally at the top level (Rules of Hooks compliance)
  const hasSinglePermission = useHasPermission(permission || '');
  const hasAnyPermissions = useHasAnyPermission(permissions || []);
  const hasAllPermissions = useHasAllPermissions(permissions || []);

  // Apply conditional logic to the results
  let hasAccess = false;

  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (permissions && permissions.length > 0) {
    hasAccess = mode === 'any' ? hasAnyPermissions : hasAllPermissions;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
