import { collections, UserRecord } from '../db/loki';
import { randomUUID } from 'crypto';

/**
 * Repository for managing users in the database.
 * Business rules:
 * - Users must have unique emails.
 * - Supports creation and lookup by email.
 */
export class UserRepository {
  /**
   * Creates a new user record.
   * Business rule: Email is stored in lowercase and must be unique.
   * @param params - User parameters.
   * @returns The created UserRecord.
   */
  async create(params: { name: string; email: string; role: 'Admin'|'Editor'|'Viewer'; passwordHash: string }): Promise<UserRecord> {
    const now = new Date();
    const rec: UserRecord = {
      id: randomUUID(),
      name: params.name,
      email: params.email.toLowerCase(),
      role: params.role,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    collections.users.insert(rec);
    return rec;
  }

  /**
   * Finds a user by email.
   * Business rule: Email lookup is case-insensitive.
   * @param email - User email.
   * @returns UserRecord or null.
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    const rec = collections.users.findOne({ email: email.toLowerCase() });
    return rec ?? null;
  }

  /**
   * Counts the number of users in the database.
   * @returns Number of users.
   */
  async count(): Promise<number> {
    return collections.users.count();
  }
}