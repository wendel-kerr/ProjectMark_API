import { UserRole } from '../users/Role'; import { IAccessStrategy, IRoleStrategyFactory } from './IAccessStrategy';
import { AdminStrategy } from './strategies/AdminStrategy'; import { EditorStrategy } from './strategies/EditorStrategy'; import { ViewerStrategy } from './strategies/ViewerStrategy';
/**
 * RoleStrategyFactory class.
 * @class
 */
export class RoleStrategyFactory implements IRoleStrategyFactory {
  forRole(role: UserRole): IAccessStrategy {
/**
 * switch method.
 * @param role - See type for details.
 * @returns See return type.
 */
    switch (role) { case UserRole.Admin: return new AdminStrategy();
      case UserRole.Editor: return new EditorStrategy();
      case UserRole.Viewer: return new ViewerStrategy();
      default: return new ViewerStrategy(); }
  }
}