import { TopicRecord, TopicVersionRecord } from '../db/loki';

/**
 * DTO for representing a topic tree structure.
 * Business rule: Used for hierarchical topic output, including children.
 */
export type TopicTreeDTO = {
  id: string;
  parentTopicId: string | null;
  name: string;
  content: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  children: TopicTreeDTO[];
};

/**
 * Maps TopicRecord, TopicVersionRecord and children to TopicTreeDTO.
 * Business rule: Combines topic, version and children for API output.
 * @param topic - Topic record from DB.
 * @param version - Topic version record from DB.
 * @param children - Array of child TopicTreeDTOs.
 * @returns TopicTreeDTO object.
 */
export function toTopicTreeDTO(topic: TopicRecord, version: TopicVersionRecord, children: TopicTreeDTO[]): TopicTreeDTO {
  return {
    id: topic.id,
    parentTopicId: topic.parentTopicId,
    name: version.name,
    content: version.content,
    version: version.version,
    createdAt: topic.createdAt,
    updatedAt: version.updatedAt,
    children,
  };
}