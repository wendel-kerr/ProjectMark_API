/**
 * Represents a node in a topic tree structure.
 * Business rule: Each node must have an id, name, and a list of children.
 */
export interface TopicTreeNode {
  id: string;
  name: string;
  children: TopicTreeNode[];
}

/**
 * Interface for topic components in a composite pattern.
 * Business rules:
 * - Each topic component must have an id, name, and optional parentId.
 * - Can add or remove child components.
 * - Can retrieve children and convert to tree structure.
 */
export interface ITopicComponent {
  readonly id: string;
  name: string;
  parentId: string | null;

  /**
   * Adds a child topic component.
   * @param child - The child component to add.
   */
  addChild(child: ITopicComponent): void;

  /**
   * Removes a child topic component by id.
   * @param childId - The id of the child to remove.
   */
  removeChild(childId: string): void;

  /**
   * Gets the list of child topic components.
   * @returns Array of child components.
   */
  getChildren(): ITopicComponent[];

  /**
   * Converts the component to a tree node structure.
   * @returns TopicTreeNode representation.
   */
  toTree(): TopicTreeNode;
}