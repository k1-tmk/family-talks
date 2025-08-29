/**
 * RolePermissions Utility
 * 
 * This file defines the permissions for different family roles.
 * It provides a centralized way to manage what each role can do.
 * 
 * Key Concepts:
 * - Role-based access control (RBAC)
 * - Permission inheritance
 * - Admin privileges
 * - Security through permission checks
 */

import { FamilyRole, RolePermissions } from '../types/Message';

/**
 * Get permissions for a specific family role
 * @param role - The family role
 * @returns RolePermissions object with boolean flags
 */
export const getRolePermissions = (role: FamilyRole): RolePermissions => {
  switch (role) {
    case 'admin':
      return {
        canAddMembers: true,
        canRemoveMembers: true,
        canEditMembers: true,
        canManageSettings: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageBackup: true,
        canInviteGuests: true,
      };

    case 'parent':
      return {
        canAddMembers: true,
        canRemoveMembers: false,
        canEditMembers: true,
        canManageSettings: false,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageBackup: false,
        canInviteGuests: true,
      };

    case 'grandparent':
      return {
        canAddMembers: false,
        canRemoveMembers: false,
        canEditMembers: false,
        canManageSettings: false,
        canModerateContent: false,
        canViewAnalytics: true,
        canManageBackup: false,
        canInviteGuests: false,
      };

    case 'child':
      return {
        canAddMembers: false,
        canRemoveMembers: false,
        canEditMembers: false,
        canManageSettings: false,
        canModerateContent: false,
        canViewAnalytics: false,
        canManageBackup: false,
        canInviteGuests: false,
      };

    case 'other':
    default:
      return {
        canAddMembers: false,
        canRemoveMembers: false,
        canEditMembers: false,
        canManageSettings: false,
        canModerateContent: false,
        canViewAnalytics: false,
        canManageBackup: false,
        canInviteGuests: false,
      };
  }
};

/**
 * Check if a user has a specific permission
 * @param userRole - The user's role
 * @param permission - The permission to check
 * @returns boolean indicating if user has permission
 */
export const hasPermission = (
  userRole: FamilyRole,
  permission: keyof RolePermissions
): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};

/**
 * Check if a user can perform an admin operation
 * @param userRole - The user's role
 * @returns boolean indicating if user has admin privileges
 */
export const isAdmin = (userRole: FamilyRole): boolean => {
  return userRole === 'admin';
};

/**
 * Check if a user can manage family members
 * @param userRole - The user's role
 * @returns boolean indicating if user can manage members
 */
export const canManageMembers = (userRole: FamilyRole): boolean => {
  return hasPermission(userRole, 'canAddMembers') || 
         hasPermission(userRole, 'canRemoveMembers') || 
         hasPermission(userRole, 'canEditMembers');
};

/**
 * Check if a user can manage family settings
 * @param userRole - The user's role
 * @returns boolean indicating if user can manage settings
 */
export const canManageSettings = (userRole: FamilyRole): boolean => {
  return hasPermission(userRole, 'canManageSettings');
};

/**
 * Get role display name
 * @param role - The role to get display name for
 * @returns Human-readable role name
 */
export const getRoleDisplayName = (role: FamilyRole): string => {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'parent':
      return 'Parent';
    case 'grandparent':
      return 'Grandparent';
    case 'child':
      return 'Child';
    case 'other':
      return 'Family Member';
    default:
      return 'Unknown';
  }
};

/**
 * Get role description
 * @param role - The role to get description for
 * @returns Human-readable role description
 */
export const getRoleDescription = (role: FamilyRole): string => {
  switch (role) {
    case 'admin':
      return 'Full control over family settings and members';
    case 'parent':
      return 'Can manage members and moderate content';
    case 'grandparent':
      return 'Can view family activity and participate in conversations';
    case 'child':
      return 'Limited access, basic messaging features';
    case 'other':
      return 'Standard family member with basic permissions';
    default:
      return 'Unknown role';
  }
};

/**
 * Get available roles for role changes (admin only)
 * @returns Array of available roles
 */
export const getAvailableRoles = (): FamilyRole[] => {
  return ['admin', 'parent', 'grandparent', 'child', 'other'];
};

/**
 * Check if a role change is allowed
 * @param currentRole - Current role of the member
 * @param newRole - New role to assign
 * @param adminRole - Role of the admin making the change
 * @returns boolean indicating if role change is allowed
 */
export const canChangeRole = (
  currentRole: FamilyRole,
  newRole: FamilyRole,
  adminRole: FamilyRole
): boolean => {
  // Only admins can change roles
  if (adminRole !== 'admin') {
    return false;
  }

  // Cannot change admin role (prevents admin lockout)
  if (currentRole === 'admin' && newRole !== 'admin') {
    return false;
  }

  // Cannot promote to admin (prevents multiple admins unless intended)
  if (newRole === 'admin') {
    return false;
  }

  return true;
};
