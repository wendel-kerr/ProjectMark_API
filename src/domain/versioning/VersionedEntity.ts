import { IVersion, IVersioned } from './IVersion';
import { VersionNotFoundError } from '../errors/DomainErrors';

/**
 * Abstract class for entities that support versioning.
 * Business rules:
 * - Each entity must maintain a list of versions.
 * - Initial version starts at 1.
 * - New versions are created by updating data.
 * - Must be able to retrieve latest, specific, and all versions.
 */
export abstract class VersionedEntity<TData> implements IVersioned<TData> {
  protected versions: IVersion<TData>[] = [];
  protected currentVersion = 0;

  /**
   * Creates the initial version for the entity.
   * Business rule: Initial version is 1 and data is frozen.
   * @param data - Initial data for the entity.
   * @returns The initial version object.
   */
  protected createInitialVersion(data: TData): IVersion<TData> {
    const now = new Date();
    const v: IVersion<TData> = {
      version: 1,
      data: Object.freeze({ ...data }),
      createdAt: now,
      updatedAt: now,
    };
    this.versions.push(v);
    this.currentVersion = 1;
    return v;
  }

  /**
   * Creates a new version by applying updates to the latest data.
   * Business rule: New version increments version number and merges updates.
   * @param update - Partial update to apply.
   * @returns The new version object.
   */
  protected createNewVersion(update: Partial<TData>): IVersion<TData> {
    const prev = this.getLatestVersion();
    const now = new Date();
    const nextVersionNumber = prev.version + 1;
    const next: IVersion<TData> = {
      version: nextVersionNumber,
      data: Object.freeze({ ...(prev.data as any), ...(update as any) }),
      createdAt: prev.createdAt,
      updatedAt: now,
    };
    this.versions.push(next);
    this.currentVersion = nextVersionNumber;
    return next;
  }

  /**
   * Gets the latest version of the entity.
   * @returns The latest version object.
   * @throws VersionNotFoundError if no versions exist.
   */
  public getLatestVersion(): IVersion<TData> {
    if (this.versions.length === 0) throw new VersionNotFoundError(1);
    return this.versions[this.versions.length - 1];
  }

  /**
   * Gets a specific version by number or 'latest'.
   * @param version - The version number or 'latest'.
   * @returns The requested version object.
   * @throws VersionNotFoundError if the version does not exist.
   */
  public getVersion(version: number | 'latest'): IVersion<TData> {
    if (version === 'latest') return this.getLatestVersion();
    const found = this.versions.find(v => v.version === version);
    if (!found) throw new VersionNotFoundError(version);
    return found;
  }

  /**
   * Gets all versions of the entity.
   * @returns Array of all version objects.
   */
  public getAllVersions(): IVersion<TData>[] {
    return [...this.versions];
  }
}