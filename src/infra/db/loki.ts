import Loki from 'lokijs';

/**
 * LokiJS database instance for the knowledge base.
 * Business rule: Database is initialized with collections for topics, versions, resources e users.
 */
export const db = new Loki('knowledge-base.db', { autoload: false });

/**
 * Record for a topic entity in the database.
 * Business rules:
 * - Each topic must have a unique id.
 * - Can have a parent topic (for tree structure).
 * - Tracks current version and timestamps.
 * - Can be soft-deleted (deletedAt).
 */
export interface TopicRecord {
  id: string;
  parentTopicId: string | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Record for a topic version in the database.
 * Business rules:
 * - Each version must have a unique id and reference a topic.
 * - Tracks version number, name, content and timestamps.
 */
export interface TopicVersionRecord {
  id: string;
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Record for a resource entity in the database.
 * Business rules:
 * - Each resource must have a unique id and reference a topic.
 * - Tracks url, description, type and timestamps.
 * - Can be soft-deleted (deletedAt).
 */
export interface ResourceRecord {
  id: string;
  topicId: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

/**
 * Record for a user entity in the database.
 * Business rules:
 * - Each user must have a unique id, name, email, role and password hash.
 * - Tracks timestamps for creation and update.
 */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Collections for each entity type in the database.
 * Business rule: Collections are indexed for efficient queries and uniqueness where needed.
 */
export const collections = {
  topics: db.addCollection('topics', { unique: ['id'], indices: ['parentTopicId', 'deletedAt'] }),
  topic_versions: db.addCollection('topic_versions', { indices: ['topicId', 'version'] }),
  resources: db.addCollection('resources', { indices: ['topicId', 'deletedAt'] }),
  users: db.addCollection('users', { unique: ['id'], indices: ['email'] }),
};