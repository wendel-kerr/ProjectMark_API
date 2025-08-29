import { collections, TopicRecord, TopicVersionRecord } from '../db/loki';
import { TopicVersionFactory } from '../../domain/versioning/TopicVersionFactory';
import { randomUUID } from 'crypto';

/**
 * Repository for managing topics and their versions in the database.
 * Business rules:
 * - Topics are organized in a tree structure.
 * - Supports CRUD operations, versioning and soft delete.
 * - Sibling topics must have unique names under the same parent.
 */
export class TopicRepository {
  /**
   * Checks if a topic record is not deleted.
   * @param rec - TopicRecord to check.
   * @returns True if not deleted.
   */
  private notDeletedFilter(rec: TopicRecord) { return !rec.deletedAt; }

  /**
   * Gets the latest version record for a topic.
   * @param topicId - Topic id.
   * @returns TopicVersionRecord or null.
   */
  private getLatestVersion(topicId: string): TopicVersionRecord | null {
    const v = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
    return v ?? null;
  }

  /**
   * Finds siblings with the same name under a parent topic.
   * Business rule: Sibling names must be unique.
   * @param parentId - Parent topic id.
   * @param name - Name to check.
   * @param exceptId - Optional id to exclude.
   * @returns Array of TopicRecord.
   */
  private siblingsWithSameName(parentId: string | null, name: string, exceptId?: string): TopicRecord[] {
    const siblings = collections.topics.find({ parentTopicId: parentId }) as TopicRecord[];
    const filtered = siblings.filter((t: TopicRecord) =>
      this.notDeletedFilter(t) && (!exceptId || t.id !== exceptId)
    );
    return filtered.filter((t: TopicRecord) => {
      const v = this.getLatestVersion(t.id);
      return v?.name === name;
    });
  }

  /**
   * Creates a root topic (no parent).
   * Business rule: Sibling names must be unique.
   * @param params - Topic parameters.
   * @returns Created topic and version.
   */
  createRoot(params: { id?: string; name: string; content: string }) {
    if (this.siblingsWithSameName(null, params.name).length > 0) {
      throw new Error(`DuplicateSiblingName:${params.name}`);
    }
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: null, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = TopicVersionFactory.createInitial({ topicId: id, name: params.name, content: params.content });
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  /**
   * Creates a child topic under a parent.
   * Business rule: Sibling names must be unique.
   * @param parentId - Parent topic id.
   * @param params - Topic parameters.
   * @returns Created topic and version.
   */
  createChild(parentId: string, params: { id?: string; name: string; content: string }) {
    const parent = collections.topics.findOne({ id: parentId });
    if (!parent || parent.deletedAt) throw new Error('ParentNotFound');
    if (this.siblingsWithSameName(parentId, params.name).length > 0) throw new Error(`DuplicateSiblingName:${params.name}`);
    const id = params.id ?? randomUUID();
    const now = new Date();
    const topic: TopicRecord = { id, parentTopicId: parentId, currentVersion: 1, createdAt: now, updatedAt: now, deletedAt: null };
    collections.topics.insert(topic);
    const version: TopicVersionRecord = TopicVersionFactory.createInitial({ topicId: id, name: params.name, content: params.content });
    collections.topic_versions.insert(version);
    return { topic, version };
  }

  /**
   * Gets a topic and its current version by id.
   * @param id - Topic id.
   * @returns Object with topic and version, or null.
   */
  getById(id: string) {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
    const version = collections.topic_versions.findOne({ topicId: id, version: topic.currentVersion });
    if (!version) return null;
    return { topic, version };
  }

  /**
   * Gets a topic record by id.
   * @param id - Topic id.
   * @returns TopicRecord or null.
   */
  getTopicRecord(id: string): TopicRecord | null {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
    return topic;
  }

  /**
   * Lists topics by parent id, including their current version.
   * @param parentId - Parent topic id.
   * @returns Array of topic/version objects.
   */
  listByParent(parentId: string | null) {
    const topics = (collections.topics.find({ parentTopicId: parentId }) as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
    return topics
      .map((t: TopicRecord) => {
        const v = collections.topic_versions.findOne({ topicId: t.id, version: t.currentVersion }) as TopicVersionRecord | null;
        return v ? { topic: t, version: v } : null;
      })
      .filter((x): x is { topic: TopicRecord; version: TopicVersionRecord } => Boolean(x));
  }

  /**
   * Lists child topic records by parent id.
   * @param parentId - Parent topic id.
   * @returns Array of TopicRecord.
   */
  listChildrenRecords(parentId: string): TopicRecord[] {
    return (collections.topics.find({ parentTopicId: parentId }) as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
  }

  /**
   * Appends a new version to a topic.
   * Business rule: Sibling names must be unique when updating name.
   * @param topicId - Topic id.
   * @param update - Fields to update.
   * @returns The new TopicVersionRecord or null.
   */
  appendVersion(topicId: string, update: { name?: string; content?: string }): TopicVersionRecord | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    if (update.name) {
      const siblings = this.siblingsWithSameName(topic.parentTopicId, update.name, topicId);
      if (siblings.length > 0) throw new Error(`DuplicateSiblingName:${update.name}`);
    }
    const latest = this.getLatestVersion(topicId);
    if (!latest) return null;
    const now = new Date();
    const next: TopicVersionRecord = TopicVersionFactory.createNext({ topicId, previous: latest, patch: update });
    collections.topic_versions.insert(next);
    topic.currentVersion = next.version;
    topic.updatedAt = now;
    collections.topics.update(topic);
    return next;
  }

  /**
   * Soft deletes a topic by id.
   * Business rule: Sets deletedAt timestamp instead of removing.
   * @param topicId - Topic id.
   * @returns True if deleted, false otherwise.
   */
  softDelete(topicId: string): boolean {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return false;
    topic.deletedAt = new Date();
    collections.topics.update(topic);
    return true;
  }

  /**
   * Lists all versions for a topic.
   * @param topicId - Topic id.
   * @returns Array of TopicVersionRecord or null.
   */
  listVersions(topicId: string): TopicVersionRecord[] | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    return collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', false)
      .data();
  }

  /**
   * Gets a specific version for a topic.
   * @param topicId - Topic id.
   * @param version - Version number.
   * @returns TopicVersionRecord or null.
   */
  getVersion(topicId: string, version: number): TopicVersionRecord | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
    return collections.topic_versions.findOne({ topicId, version }) ?? null;
  }

  /**
   * Gets child topic records by parent id.
   * @param parentId - Parent topic id.
   * @returns Array of TopicRecord.
   */
  public getChildren(parentId: string): TopicRecord[] {
    const rows = (collections.topics
      .chain()
      .find({ parentTopicId: parentId })
      .data() as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
    return rows;
  }

  /**
   * Gets the latest version number for a topic.
   * @param topicId - Topic id.
   * @returns Latest version number or 0 if none.
   */
  public latestVersionNumber(topicId: string): number {
    const v = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
    return v?.version ?? 0;
  }
}