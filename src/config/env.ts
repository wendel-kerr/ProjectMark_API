import 'dotenv/config';
import { z } from 'zod';

/**
 * Schema for environment variables validation.
 *
 * Business rules:
 * - NODE_ENV must be one of 'development', 'test', or 'production'. Defaults to 'development'.
 * - PORT must be a positive integer. Defaults to 3000.
 * - JWT_SECRET must be at least 16 characters long.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'), // Allowed environments
  PORT: z.coerce.number().int().positive().default(3000), // Must be a positive integer
  JWT_SECRET: z.string().min(16, 'JWT_SECRET muito curto (>=16 caracteres)'), // Minimum 16 characters
});

/**
 * Parses and validates environment variables using EnvSchema.
 */
export const env = EnvSchema.parse(process.env);