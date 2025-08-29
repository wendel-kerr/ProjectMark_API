/**
 * Interface representing a version of an entity's data.
 * Business rule: Each version must have a unique number, data, and timestamps.
 */
export interface IVersion<TData> {
  version: number;
  data: TData;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for entities that support versioning.
 * Business rules:
 * - Must be able to retrieve the latest version.
 * - Must be able to retrieve a specific version by number or 'latest'.
 * - Must be able to retrieve all versions.
 */
export interface IVersioned<TData> {
  /**
   * Gets the latest version of the entity.
   * @returns The latest version.
   */
  getLatestVersion(): IVersion<TData>;

  /**
   * Gets a specific version by number or 'latest'.
   * @param version - The version number or 'latest'.
   * @returns The requested version.
   */
  getVersion(version: number | 'latest'): IVersion<TData>;

  /**
   * Gets all versions of the entity.
   * @returns Array of all versions.
   */
  getAllVersions(): IVersion<TData>[];
}