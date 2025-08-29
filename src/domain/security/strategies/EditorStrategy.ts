import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';

/**
 * Access strategy for editor users.
 * Business rules:
 * - Editors can only read users.
 * - Editors can read, create, update, and delete topics and resources.
 */
export class EditorStrategy implements IAccessStrategy {
  /**
   * Checks if the editor can perform the given action on the entity.
   * @param action - The action to check.
   * @param entity - The entity to check against.
   * @returns True if allowed by business rules, otherwise false.
   */
  can(action: Action, entity: Entity): boolean {
    // Editors can only read users
    if (entity === 'user') return action === 'read';
    // Editors can read, create, update, and delete topics and resources
    if (entity === 'topic' || entity === 'resource') return ['read', 'create', 'update', 'delete'].includes(action);
    return false;
  }
}