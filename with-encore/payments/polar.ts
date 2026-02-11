import { Polar } from '@polar-sh/sdk'
import { secret } from 'encore.dev/config'

export const POLAR_ACCESS_TOKEN = secret('POLAR_ACCESS_TOKEN')
export const POLAR_WEBHOOK_SECRET = secret('POLAR_WEBHOOK_SECRET')

export const polar = new Polar({
  accessToken: POLAR_ACCESS_TOKEN(),
  server: 'sandbox',
})
