import { Polar } from '@polar-sh/sdk'
import 'dotenv/config'
import { env } from '@/config/env'

export const getPolarClient = () => {
  const accessToken = env.POLAR_ACCESS_TOKEN
  const server = env.POLAR_MODE
  return new Polar({
    accessToken,
    server,
  })
}
