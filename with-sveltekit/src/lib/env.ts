import { z } from 'zod'
import { env } from '$env/dynamic/private';

const envSchema = z.object({
    POLAR_MODE: z.enum(['sandbox', 'production']).default('production'),
    POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
    POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET is required'),
    POLAR_SUCCESS_URL: z.url('POLAR_SUCCESS_URL must be a valid URL').optional(),
})

export default envSchema.parse({
    POLAR_MODE: env.POLAR_MODE,
    POLAR_SUCCESS_URL: env.POLAR_SUCCESS_URL,
    POLAR_ACCESS_TOKEN: env.POLAR_ACCESS_TOKEN,
    POLAR_WEBHOOK_SECRET: env.POLAR_WEBHOOK_SECRET,
});
