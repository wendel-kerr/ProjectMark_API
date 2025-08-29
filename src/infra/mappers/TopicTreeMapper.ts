import { TopicRecord, TopicVersionRecord } from '../db/loki';

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
 * toTopicTreeDTO function.
 * @param topic - See type for details.
 * @param version - See type for details.
 * @param children - See type for details.
 * @returns See return type.
 * @function
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