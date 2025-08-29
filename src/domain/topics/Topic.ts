import { TopicNode } from './TopicNode';
import { TopicTreeNode } from './ITopicComponent';
import { VersionedEntity } from '../versioning/VersionedEntity';

/**
 * Snapshot of a topic's state.
 * Business rule: Must contain name and content.
 */
export type TopicSnapshot = {
  name: string;
  content: string;
};

/**
 * Represents a topic entity with versioning and tree structure.
 * Business rules:
 * - Each topic must have an id, name, content, and optional parentId.
 * - Supports versioning of topic content.
 * - Can be organized in a tree structure.
 */
export class Topic extends VersionedEntity<TopicSnapshot> {
  private node: TopicNode;

  /**
   * Creates a new Topic instance.
   * @param params - Topic parameters (id, name, content, parentId).
   */
  constructor(params: { id: string; name: string; content: string; parentId?: string | null }) {
    super();
    this.node = new TopicNode({ id: params.id, name: params.name, parentId: params.parentId ?? null });
    this.createInitialVersion({ name: params.name, content: params.content });
  }

  /**
   * Gets the topic id.
   */
  get id(): string { return this.node.id; }

  /**
   * Gets the topic name.
   */
  get name(): string { return this.node.name; }

  /**
   * Sets the topic name.
   */
  set name(v: string) { this.node.name = v; }

  /**
   * Gets the parent topic id.
   */
  get parentId(): string | null { return this.node.parentId; }

  /**
   * Adds a child topic.
   * @param child - The child topic to add.
   */
  addChild(child: Topic): void { this.node.addChild(child.nodeAsComponent()); }

  /**
   * Removes a child topic by id.
   * @param childId - The id of the child to remove.
   */
  removeChild(childId: string): void { this.node.removeChild(childId); }

  /**
   * Gets the list of child topics.
   * @returns Array of child topics.
   */
  getChildren(): Topic[] { return this.node.getChildren() as Topic[]; }

  /**
   * Converts the topic to a tree node structure.
   * @returns TopicTreeNode representation.
   */
  toTree(): TopicTreeNode { return this.node.toTree(); }

  /**
   * Returns the internal TopicNode as a component.
   * @returns TopicNode instance.
   */
  private nodeAsComponent() { return this.node; }

  /**
   * Updates the topic content and optionally the name, creating a new version.
   * Business rule: Updating content creates a new version.
   * @param update - Partial update for topic snapshot.
   * @returns The new version.
   */
  updateContent(update: Partial<TopicSnapshot>) {
    const v = this.createNewVersion(update);
    if (update.name) this.node.name = update.name;
    return v;
  }
}