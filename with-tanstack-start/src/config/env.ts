import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
  POLAR_SUCCESS_URL: z.url({ message: 'POLAR_SUCCESS_URL must be a valid URL' }).optional(),
})

export const env = envSchema.parse(process.env)
