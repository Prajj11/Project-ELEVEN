import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  LLM_PROVIDER: z.enum(['gemini', 'openai', 'fallback']).default('fallback'),
  LLM_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().default('gemini-1.5-flash'),
  LLM_TIMEOUT_MS: z.coerce.number().default(5000),
  LLM_MAX_REQUESTS_PER_MATCH: z.coerce.number().default(20),
});

export const env = envSchema.parse(process.env);
