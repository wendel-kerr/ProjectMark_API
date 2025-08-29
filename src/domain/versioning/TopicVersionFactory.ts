import { TopicVersionRecord } from '../../infra/db/loki';
import { randomUUID } from 'crypto';

/**
 * Factory for creating topic version records.
 * Business rules:
 * - Initial version must start at 1.
 * - Next version increments from previous.
 * - Each version must have unique id and timestamps.
 */
export class TopicVersionFactory {
  /**
   * Creates the initial version record for a topic.
   * @param params - Topic parameters (topicId, name, content, now).
   * @returns TopicVersionRecord for the initial version.
   */
  static createInitial(params: { topicId: string; name: string; content: string; now?: Date }): TopicVersionRecord {
    const now = params.now ?? new Date();
    return {
      id: randomUUID(),
      topicId: params.topicId,
      version: 1,
      name: params.name,
      content: params.content,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Creates the next version record for a topic.
   * Business rule: Next version must increment from previous and update fields as needed.
   * @param params - Parameters including previous version and patch.
   * @returns TopicVersionRecord for the next version.
   */
  static createNext(params: { topicId: string; previous: TopicVersionRecord; patch: { name?: string; content?: string }; now?: Date }): TopicVersionRecord {
    const now = params.now ?? new Date();
    return {
      id: randomUUID(),
      topicId: params.topicId,
      version: params.previous.version + 1,
      name: params.patch.name ?? params.previous.name,
      content: params.patch.content ?? params.previous.content,
      createdAt: params.previous.createdAt,
      updatedAt: now,
    };
  }
}