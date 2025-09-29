import { Polar } from '@polar-sh/sdk'

export const getPolarClient = () => {
  const config = useRuntimeConfig()
  const isSandbox = config.mode === 'sandbox'

  const accessToken = isSandbox ? config.polarAccessToken : config.accessToken

  if (!accessToken) {
    throw new Error(`Missing ${isSandbox ? 'SANDBOX_POLAR_ACCESS_TOKEN' : 'POLAR_ACCESS_TOKEN'}`)
  }

  return new Polar({
    accessToken,
    server: config.mode as 'production' | 'sandbox' | undefined,
  })
}
