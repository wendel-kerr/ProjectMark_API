import { Router } from 'express';
import { UserRepository } from '../infra/repositories/UserRepository';
import { AuthService } from '../services/Services';
import { authGuard } from '../middleware/auth';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);

/**
 * Express router for authentication endpoints.
 * Business rules:
 * - Handles user login, seeding defaults, and user info retrieval.
 */
export const authRouter = Router();

/**
 * Seeds default users if the database is empty.
 * Business rule: Only seeds if no users exist.
 * @route POST /auth/seed-defaults
 */
authRouter.post('/seed-defaults', async (_req, res, next) => {
  try {
    await authService.seedDefaultsIfEmpty();
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

/**
 * Authenticates a user and returns a JWT.
 * Business rule: Seeds defaults before login attempt.
 * @route POST /auth/login
 */
authRouter.post('/login', async (req, res, next) => {
  try {
    await authService.seedDefaultsIfEmpty();
    const out = await authService.login(req.body);
    res.json(out);
  } catch (err: any) {
    if (err?.message === 'INVALID_CREDENTIALS') return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
    next(err);
  }
});

/**
 * Returns the authenticated user's info.
 * Business rule: Requires authentication.
 * @route GET /auth/me
 */
authRouter.get('/me', authGuard, async (req, res) => {
  res.json({ user: req.user });
});