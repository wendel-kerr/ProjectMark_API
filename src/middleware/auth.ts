import { env } from '../config/env';



import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import { DefaultRBACStrategy, PermissionStrategy } from '../domain/security/strategies/PermissionStrategy';

import { UserRole } from '../domain/users/Role';

const JWT_SECRET = env.JWT_SECRET;


export type AuthUser = { id: string; name: string; email: string; role: UserRole };

declare global {
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}


/**
 * signJwt function.
 * @param user - See type for details.
 * @returns See return type.
 * @function
 */
export function signJwt(user: AuthUser): string {
  
  return jwt.sign({ sub: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
}


/**
 * authGuard function.
 * @param req - See type for details.
 * @param res - See type for details.
 * @param next - See type for details.
 * @returns See return type.
 * @function
 */
export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
  
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: payload.sub, name: payload.name, email: payload.email, role: payload.role };
    next();
  } catch (_err) {
  
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

const strategy: PermissionStrategy = new DefaultRBACStrategy();

/**
 * requirePermission function.
 * @param action - See type for details.
 * @param resource - See type for details.
 * @returns See return type.
 * @function
 */
export function requirePermission(action: 'read'|'write', resource: 'topic'|'resource'|'user') {
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ code: 'UNAUTHORIZED' });
    const ok = strategy.allows(req.user.role, action, resource);
    if (!ok) return res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    next();
  };
}