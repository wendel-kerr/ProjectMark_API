import { TopicRecord, TopicVersionRecord, ResourceRecord, UserRecord } from '../db/loki';

/**
 * Data Transfer Object (DTO) for Topic.
 * Business rule: Represents a topic with its current version and timestamps.
 */
export type TopicDTO = {
  id: string;
  parentTopicId: string | null;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * DTO for Topic Version.
 * Business rule: Represents a specific version of a topic.
 */
export type TopicVersionDTO = {
  topicId: string;
  version: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * DTO for Resource.
 * Business rule: Represents a resource linked to a topic.
 */
export type ResourceDTO = {
  id: string;
  topicId: string;
  url: string;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * DTO for public user data (no password hash).
 * Business rule: Only exposes non-sensitive user fields.
 */
export type PublicUserDTO = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Maps TopicRecord and TopicVersionRecord to TopicDTO.
 * Business rule: Combines topic and version data for API output.
 * @param topicRec - Topic record from DB.
 * @param versionRec - Topic version record from DB.
 * @returns TopicDTO object.
 */
export function toTopicDTO(topicRec: TopicRecord, versionRec: TopicVersionRecord): TopicDTO {
  return {
    id: topicRec.id,
    parentTopicId: topicRec.parentTopicId,
    name: versionRec.name,
    content: versionRec.content,
    version: versionRec.version,
    createdAt: topicRec.createdAt,
    updatedAt: versionRec.updatedAt,
  };
}

/**
 * Maps TopicVersionRecord to TopicVersionDTO.
 * Business rule: Used for version history output.
 * @param v - TopicVersionRecord from DB.
 * @returns TopicVersionDTO object.
 */
export function toTopicVersionDTO(v: TopicVersionRecord): TopicVersionDTO {
  return {
    topicId: v.topicId,
    version: v.version,
    name: v.name,
    content: v.content,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

/**
 * Maps ResourceRecord to ResourceDTO.
 * Business rule: Used for resource API output.
 * @param r - ResourceRecord from DB.
 * @returns ResourceDTO object.
 */
export function toResourceDTO(r: ResourceRecord): ResourceDTO {
  return {
    id: r.id,
    topicId: r.topicId,
    url: r.url,
    description: r.description,
    type: r.type,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

/**
 * Maps UserRecord to PublicUserDTO.
 * Business rule: Only exposes public user fields.
 * @param u - UserRecord from DB.
 * @returns PublicUserDTO object.
 */
export function toPublicUserDTO(u: UserRecord): PublicUserDTO {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

/**
 * DTO for representing a topic tree structure.
 * Business rule: Used for hierarchical topic output, with optional resources.
 */
export type TopicTreeDTO = {
  id: string;
  name: string;
  version: number;
  children: TopicTreeDTO[];
  resources?: Array<{
    id: string;
    url: string;
    description: string;
    type: string;
  }>;
};