/**
 * Base class for domain-specific errors.
 * Business rule: All domain errors must have a code and message, and may include details.
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  /**
   * Constructs a domain error.
   * @param code - Unique error code for the domain error.
   * @param message - Human-readable error message.
   * @param details - Optional additional error details.
   */
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error thrown when a requested version is not found.
 * Business rule: Version must exist in the system.
 */
export class VersionNotFoundError extends DomainError {
  constructor(version: number) {
    super('VERSION_NOT_FOUND', `Version ${version} not found`);
  }
}

/**
 * Error thrown when a sibling with the same name already exists.
 * Business rule: Sibling names must be unique within their context.
 */
export class DuplicateSiblingNameError extends DomainError {
  constructor(name: string) {
    super('DUPLICATE_SIBLING_NAME', `Sibling with name "${name}" already exists`);
  }
}

/**
 * Error thrown when an action is not authorized for an entity.
 * Business rule: User must have permission to perform the action on the entity.
 */
export class UnauthorizedError extends DomainError {
  constructor(action: string, entity: string) {
    super('UNAUTHORIZED', `Not allowed to ${action} ${entity}`);
  }
}