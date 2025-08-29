/**
 * Interface for entities with a unique identifier.
 * Business rule: Every entity must have a unique string id.
 */
export interface Identifiable {
	id: string;
}

/**
 * Interface for entities with timestamps.
 * Business rule: Entities may have creation and update dates.
 */
export interface Timestamped {
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Base entity type combining Identifiable and optional Timestamped properties.
 */
export type BaseEntity = Identifiable & Partial<Timestamped>;