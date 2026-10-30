/**
 * VidCraft AI - Environment Configuration
 * Centralized environment variable management
 */

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  // Separate secret for refresh tokens. Optional for backward compatibility:
  // when unset it falls back to JWT_SECRET (see loadEnv), but production should
  // set a distinct value of at least 32 characters.
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  GEMINI_API_KEY: z.string().default(''),

  CORS_ORIGINS: z.string().default('http://localhost:8081'),

  DB_PATH: z.string().default('./data/vidcraft.db'),
});

// JWT_REFRESH_SECRET is always resolved to a concrete string by loadEnv().
export type Env = Omit<z.infer<typeof envSchema>, 'JWT_REFRESH_SECRET'> & {
  JWT_REFRESH_SECRET: string;
};

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation failed: ${JSON.stringify(formatted)}`);
  }

  const data = result.data;

  // Fall back to JWT_SECRET when no dedicated refresh secret is provided, so
  // existing single-secret deployments keep working. Warn so operators rotate.
  if (!data.JWT_REFRESH_SECRET) {
    if (data.NODE_ENV === 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[env] JWT_REFRESH_SECRET is not set; falling back to JWT_SECRET. ' +
          'Set a distinct JWT_REFRESH_SECRET in production for stronger isolation.'
      );
    }
    return { ...data, JWT_REFRESH_SECRET: data.JWT_SECRET };
  }

  return { ...data, JWT_REFRESH_SECRET: data.JWT_REFRESH_SECRET };
}

export const env = loadEnv();
