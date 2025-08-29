import { UserRole } from '../users/Role';

/**
 * Entity types for access control.
 * Business rule: Only these entities are subject to access strategies.
 */
export type Entity = 'topic' | 'resource' | 'user';

/**
 * Action types for access control.
 * Business rule: Only these actions are allowed on entities.
 */
export type Action = 'read' | 'create' | 'update' | 'delete';

/**
 * Interface for access strategies.
 * Business rule: Determines if an action is allowed on an entity, possibly using context.
 */
export interface IAccessStrategy {
	/**
	 * Checks if the action is allowed on the entity in the given context.
	 * @param action - The action to check.
	 * @param entity - The entity to check against.
	 * @param context - Optional context for advanced rules.
	 * @returns True if allowed, otherwise false.
	 */
	can(action: Action, entity: Entity, context?: unknown): boolean;
}

/**
 * Factory interface for creating access strategies based on user role.
 * Business rule: Each role must have a corresponding access strategy.
 */
export interface IRoleStrategyFactory {
	/**
	 * Returns the access strategy for the given user role.
	 * @param role - The user's role.
	 * @returns The corresponding access strategy.
	 */
	forRole(role: UserRole): IAccessStrategy;
}