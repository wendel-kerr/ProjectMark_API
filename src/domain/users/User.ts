


import { Identifiable, Timestamped } from '../common/BaseTypes';

import { UserRole } from './Role';

export interface IUser extends Identifiable, Timestamped { name: string; email: string; role: UserRole; passwordHash: string; }

export type PublicUser = Omit<IUser, 'passwordHash'>;