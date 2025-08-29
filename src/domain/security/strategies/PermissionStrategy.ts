import { UserRole } from '../../users/Role';

/**
 * Interface for permission strategies.
 * Business rule: Determines if a user role is allowed to perform an action on a resource.
 */
export interface PermissionStrategy {
  /**
   * Checks if the given role is allowed to perform the action on the resource.
   * @param role - The user's role.
   * @param action - The action to check ('read' or 'write').
   * @param resource - The resource type.
   * @returns True if allowed, otherwise false.
   */
  allows(role: UserRole, action: 'read' | 'write', resource: 'topic' | 'resource' | 'user'): boolean;
}

/**
 * Default Role-Based Access Control (RBAC) strategy implementation.
 * Business rules:
 * - Admins can do anything.
 * - Editors can read/write topics and resources, and only read users.
 * - Viewers can only read any resource.
 */
export class DefaultRBACStrategy implements PermissionStrategy {
  /**
   * Checks if the given role is allowed to perform the action on the resource.
   * @param role - The user's role.
   * @param action - The action to check ('read' or 'write').
   * @param resource - The resource type.
   * @returns True if allowed, otherwise false.
   */
  allows(role: UserRole, action: 'read' | 'write', resource: 'topic' | 'resource' | 'user'): boolean {
    // Admins can do anything
    if (role === UserRole.Admin) return true;

    // Editors can read/write topics and resources, and only read users
    if (role === UserRole.Editor) {
      if (resource === 'topic' || resource === 'resource') return true;
      if (resource === 'user') return action === 'read';
    }

    // Viewers can only read any resource
    if (role === UserRole.Viewer) {
      return action === 'read';
    }

    return false;
  }
}