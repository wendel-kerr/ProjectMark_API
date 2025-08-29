import { Topic, TopicSnapshot } from './Topic';

/**
 * Factory for creating Topic instances and managing topic versions.
 * Business rules:
 * - Root topics must have parentId as null.
 * - Child topics must reference their parent.
 * - Updating a topic creates a new version.
 */
export class TopicFactory {
  /**
   * Creates a root topic (no parent).
   * @param params - Topic parameters (id, name, content).
   * @returns New Topic instance.
   */
  static createRoot(params: { id: string; name: string; content: string }): Topic {
    return new Topic({ id: params.id, name: params.name, content: params.content, parentId: null });
  }

  /**
   * Creates a child topic and adds it to the parent.
   * @param parent - The parent topic.
   * @param params - Topic parameters (id, name, content).
   * @returns New child Topic instance.
   */
  static createChild(parent: Topic, params: { id: string; name: string; content: string }): Topic {
    const child = new Topic({ id: params.id, name: params.name, content: params.content, parentId: parent.id });
    parent.addChild(child);
    return child;
  }

  /**
   * Updates a topic and creates a new version.
   * Business rule: Every update creates a new version.
   * @param topic - The topic to update.
   * @param update - Partial update for topic snapshot.
   * @returns The new version.
   */
  static nextVersion(topic: Topic, update: Partial<TopicSnapshot>) {
    return topic.updateContent(update);
  }
}