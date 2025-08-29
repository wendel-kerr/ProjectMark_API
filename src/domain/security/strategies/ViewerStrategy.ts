import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';

/**
 * Access strategy for viewer users.
 * Business rule: Viewers can only read topics and resources.
 */
export class ViewerStrategy implements IAccessStrategy {
  /**
   * Checks if the viewer can perform the given action on the entity.
   * @param action - The action to check.
   * @param entity - The entity to check against.
   * @returns True if allowed by business rules, otherwise false.
   */
  can(action: Action, entity: Entity): boolean {
    // Viewers can only read topics and resources
    if ((entity === 'topic' || entity === 'resource') && action === 'read') return true;
    return false;
  }
}