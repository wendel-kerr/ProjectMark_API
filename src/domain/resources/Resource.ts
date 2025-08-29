import { Identifiable, Timestamped } from '../common/BaseTypes';

/**
 * Allowed types for resources.
 * Business rule: Resource type must be one of the predefined types or a custom string.
 */
export type ResourceType = 'video' | 'article' | 'pdf' | 'link' | string;

/**
 * Interface representing a resource entity.
 * Business rules:
 * - Each resource must be identifiable and timestamped.
 * - Must be linked to a topic (topicId).
 * - Must have a valid URL.
 * - Description is optional.
 * - Type must follow ResourceType.
 */
export interface IResource extends Identifiable, Timestamped {
	topicId: string;
	url: string;
	description?: string;
	type: ResourceType;
}