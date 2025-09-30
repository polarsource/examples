import { Polar } from '@polar-sh/sdk'

export const getPolarClient = () => {
  const config = useRuntimeConfig()

  const accessToken = config.accessToken

  if (!accessToken) {
    throw new Error(`Missing POLAR_ACCESS_TOKEN `)
  }

  return new Polar({
    accessToken,
    server: config.mode as 'production' | 'sandbox' | undefined,
  })
}

