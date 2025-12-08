import { z } from 'zod'

const envSchema = z.object({
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN is required'),
  POLAR_ORG_ID: z.string().min(1, 'POLAR_ORG_ID is required'),
})

export default envSchema.parse(process.env)
