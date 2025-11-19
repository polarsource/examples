import { Polar } from '@polar-sh/sdk'
import { POLAR_OAT, POLAR_MODE } from 'astro:env/server'

export type Polar_Mode =  'production' | 'sandbox' | undefined

export const createPolarClient = async () => {
  const accessToken = POLAR_OAT

  if (!accessToken) {
    throw new Error(`Missing POLAR_OAT environment variable`)
  }

  return new Polar({
    accessToken,
    server: POLAR_MODE as Polar_Mode,
  })
}

export const polarClient = await createPolarClient()
