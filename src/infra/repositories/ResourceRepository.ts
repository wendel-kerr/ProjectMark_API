import { collections, ResourceRecord } from '../db/loki';
import { randomUUID } from 'crypto';

/**
 * Repository for managing resources in the database.
 * Business rules:
 * - Resources are linked to topics.
 * - Supports CRUD operations and soft delete.
 */
export class ResourceRepository {
  /**
   * Creates a new resource record.
   * Business rule: Resource must have topicId, url, type and timestamps.
   * @param params - Resource parameters.
   * @returns The created ResourceRecord.
   */
  create(params: { topicId: string; url: string; description?: string; type: string }): ResourceRecord {
    const now = new Date();
    const rec: ResourceRecord = {
      id: randomUUID(),
      topicId: params.topicId,
      url: params.url,
      description: params.description,
      type: params.type,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    collections.resources.insert(rec);

    return rec;
  }

  /**
   * Gets a resource by id.
   * Business rule: Returns null if resource is deleted.
   * @param id - Resource id.
   * @returns ResourceRecord or null.
   */
  getById(id: string): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;

    return rec;
  }

  /**
   * Lists resources by topic id.
   * Business rule: Only non-deleted resources are returned.
   * @param topicId - Topic id.
   * @returns Array of ResourceRecord.
   */
  listByTopic(topicId: string): ResourceRecord[] {
    return collections.resources.find({ topicId }).filter((r: ResourceRecord) => !r.deletedAt);
  }

  /**
   * Updates a resource by id.
   * Business rule: Only non-deleted resources can be updated.
   * @param id - Resource id.
   * @param update - Fields to update.
   * @returns Updated ResourceRecord or null.
   */
  update(id: string, update: { url?: string; description?: string; type?: string }): ResourceRecord | null {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return null;
    if (update.url !== undefined) rec.url = update.url;
    if (update.description !== undefined) rec.description = update.description;
    if (update.type !== undefined) rec.type = update.type;
    rec.updatedAt = new Date();
    collections.resources.update(rec);

    return rec;
  }

  /**
   * Soft deletes a resource by id.
   * Business rule: Sets deletedAt timestamp instead of removing.
   * @param id - Resource id.
   * @returns True if deleted, false otherwise.
   */
  softDelete(id: string): boolean {
    const rec = collections.resources.findOne({ id });
    if (!rec || rec.deletedAt) return false;
    rec.deletedAt = new Date();
    collections.resources.update(rec);

    return true;
  }
}