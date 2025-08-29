import { UserRole } from '../users/Role';
import { IAccessStrategy, IRoleStrategyFactory } from './IAccessStrategy';
import { AdminStrategy } from './strategies/AdminStrategy';
import { EditorStrategy } from './strategies/EditorStrategy';
import { ViewerStrategy } from './strategies/ViewerStrategy';

/**
 * Factory for creating access strategies based on user roles.
 * Business rule: Each user role must map to a specific access strategy.
 */
export class RoleStrategyFactory implements IRoleStrategyFactory {
  /**
   * Returns the access strategy for the given user role.
   * @param role - The user's role.
   * @returns The corresponding access strategy instance.
   * Business rule: Unknown roles default to ViewerStrategy (read-only).
   */
  forRole(role: UserRole): IAccessStrategy {
    switch (role) {
      case UserRole.Admin:
        return new AdminStrategy();
      case UserRole.Editor:
        return new EditorStrategy();
      case UserRole.Viewer:
        return new ViewerStrategy();
      default:
        // Unknown roles default to read-only access
        return new ViewerStrategy();
    }
  }
}