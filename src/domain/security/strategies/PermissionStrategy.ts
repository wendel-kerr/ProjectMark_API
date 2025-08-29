


import { UserRole } from '../../users/Role';


export interface PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean;
}


/**
 * DefaultRBACStrategy class.
 * @class
 */
export class DefaultRBACStrategy implements PermissionStrategy {
  allows(role: UserRole, action: 'read'|'write', resource: 'topic'|'resource'|'user'): boolean {
    if (role === UserRole.Admin) return true;
/**
 * if method.
 * @param role - See type for details.
 * @returns See return type.
 */
    if (role === UserRole.Editor) {
      if (resource === 'topic' || resource === 'resource') return true;
      if (resource === 'user') return action === 'read';
    }
/**
 * if method.
 * @param role - See type for details.
 * @returns See return type.
 */
    if (role === UserRole.Viewer) {
  
      return action === 'read';
    }
  
    return false;
  }
}