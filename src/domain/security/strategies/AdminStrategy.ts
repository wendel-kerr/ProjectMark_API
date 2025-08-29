import { IAccessStrategy, Action, Entity } from '../IAccessStrategy';

/**
 * Access strategy for admin users.
 * Business rule: Admins have permission to perform any action on any entity.
 */
export class AdminStrategy implements IAccessStrategy {
	/**
	 * Checks if the admin can perform the given action on the entity.
	 * Always returns true for admins.
	 * @param _action - The action to check.
	 * @param _entity - The entity to check against.
	 * @returns Always true.
	 */
	can(_action: Action, _entity: Entity): boolean {
		return true;
	}
}