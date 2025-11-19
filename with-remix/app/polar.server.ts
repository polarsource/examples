import { Polar } from '@polar-sh/sdk'
import 'dotenv/config'

export const getPolarClient = () => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  const server = process.env.POLAR_MODE as 'production' | 'sandbox' | undefined

  if (!accessToken) {
    throw new Error('Missing POLAR_ACCESS_TOKEN environment variable')
  }

  return new Polar({
    accessToken,
    server,
  })
}
