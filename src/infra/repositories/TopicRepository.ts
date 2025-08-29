


import { collections, TopicRecord, TopicVersionRecord } from '../db/loki';

import { TopicVersionFactory } from '../../domain/versioning/TopicVersionFactory';

import { randomUUID } from 'crypto';


/**
 * TopicRepository class.
 * @class
 */
export class TopicRepository {
/**
 * notDeletedFilter method.
 * @param rec - See type for details.
 * @returns See return type.
 */
  private notDeletedFilter(rec: TopicRecord) { return !rec.deletedAt; }

  
  private getLatestVersion(topicId: string): TopicVersionRecord | null {
    const v = collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', true)
      .limit(1)
      .data()[0];
  
    return v ?? null;
  }

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
 * createRoot method.
 * @param params - See type for details.
 * @returns See return type.
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
 * createChild method.
 * @param parentId - See type for details.
 * @param params - See type for details.
 * @returns See return type.
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
 * getById method.
 * @param id - See type for details.
 * @returns See return type.
 */
  getById(id: string) {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
    const version = collections.topic_versions.findOne({ topicId: id, version: topic.currentVersion });
    if (!version) return null;
  
    return { topic, version };
  }

  
  getTopicRecord(id: string): TopicRecord | null {
    const topic = collections.topics.findOne({ id });
    if (!topic || topic.deletedAt) return null;
  
    return topic;
  }

  
/**
 * listByParent method.
 * @param parentId - See type for details.
 * @returns See return type.
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

  
  listChildrenRecords(parentId: string): TopicRecord[] {
  
    return (collections.topics.find({ parentTopicId: parentId }) as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
  }

  
/**
 * appendVersion method.
 * @param topicId - See type for details.
 * @param update - See type for details.
 * @returns See return type.
 */
  appendVersion(topicId: string, update: { name?: string; content?: string }) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
/**
 * if method.
 * @param update.name - See type for details.
 * @returns See return type.
 */
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
 * softDelete method.
 * @param topicId - See type for details.
 * @returns See return type.
 */
  softDelete(topicId: string) {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return false;
    topic.deletedAt = new Date();
    collections.topics.update(topic);
  
    return true;
  }

  
  listVersions(topicId: string): TopicVersionRecord[] | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
  
    return collections.topic_versions
      .chain()
      .find({ topicId })
      .simplesort('version', false)
      .data();
  }

  
  getVersion(topicId: string, version: number): TopicVersionRecord | null {
    const topic = collections.topics.findOne({ id: topicId });
    if (!topic || topic.deletedAt) return null;
  
    return collections.topic_versions.findOne({ topicId, version }) ?? null;
  }



  public getChildren(parentId: string): TopicRecord[] {
    const rows = (collections.topics
      .chain()
      .find({ parentTopicId: parentId })
      .data() as TopicRecord[])
      .filter((t: TopicRecord) => this.notDeletedFilter(t));
    return rows;
  }




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