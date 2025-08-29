


import { Router } from 'express';

import { UserRepository } from '../infra/repositories/UserRepository';

import { AuthService } from '../services/Services';

import { authGuard } from '../middleware/auth';

const userRepo = new UserRepository();
const authService = new AuthService(userRepo);


export const authRouter = Router();

  
authRouter.post('/seed-defaults', async (_req, res, next) => {
  try {
    await authService.seedDefaultsIfEmpty();
    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
});

  
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

  
authRouter.get('/me', authGuard, async (req, res) => {
  res.json({ user: req.user });
});