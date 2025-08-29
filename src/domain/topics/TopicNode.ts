import { ITopicComponent, TopicTreeNode } from './ITopicComponent';

/**
 * Represents a node in the topic tree structure.
 * Business rules:
 * - Each node must have an id, name, and optional parentId.
 * - Can have multiple child nodes.
 */
export class TopicNode implements ITopicComponent {
  public readonly id: string;
  public name: string;
  public parentId: string | null;
  private children: ITopicComponent[] = [];

  /**
   * Creates a new TopicNode instance.
   * @param params - Node parameters (id, name, parentId).
   */
  constructor(params: { id: string; name: string; parentId?: string | null }) {
    this.id = params.id;
    this.name = params.name;
    this.parentId = params.parentId ?? null;
  }

  /**
   * Adds a child node to this node.
   * @param child - The child topic component to add.
   */
  addChild(child: ITopicComponent): void {
    this.children.push(child);
  }

  /**
   * Removes a child node by id.
   * Business rule: Only removes if id matches.
   * @param childId - The id of the child to remove.
   */
  removeChild(childId: string): void {
    this.children = this.children.filter(c => c.id !== childId);
  }

  /**
   * Gets the list of child nodes.
   * @returns Array of child topic components.
   */
  getChildren(): ITopicComponent[] {
    return [...this.children];
  }

  /**
   * Converts this node to a tree node structure.
   * @returns TopicTreeNode representation.
   */
  toTree(): TopicTreeNode {
    return {
      id: this.id,
      name: this.name,
      children: this.children.map(c => c.toTree()),
    };
  }
}