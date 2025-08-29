import { Identifiable, Timestamped } from '../common/BaseTypes';
import { UserRole } from './Role';

/**
 * Interface representing a user entity.
 * Business rules:
 * - Each user must have a name, email, role, and password hash.
 * - User must be identifiable and timestamped.
 */
export interface IUser extends Identifiable, Timestamped {
	name: string;
	email: string;
	role: UserRole;
	passwordHash: string;
}

/**
 * Type representing a public user (without password hash).
 * Business rule: Password hash must not be exposed publicly.
 */
export type PublicUser = Omit<IUser, 'passwordHash'>;