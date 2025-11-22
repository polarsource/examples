import { Polar } from '@polar-sh/sdk'
import '@dotenvx/dotenvx/config'
import { env } from '@/config/env'

export const polar = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.POLAR_MODE
})
