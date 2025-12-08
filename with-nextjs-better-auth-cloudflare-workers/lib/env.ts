import { z } from 'zod'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('sandbox'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().optional(),
})

export default envSchema.parse(process.env)

