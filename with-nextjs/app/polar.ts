import { Polar } from '@polar-sh/sdk'

export const polar = new Polar({
  accessToken: (): any => {
    if (!process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN) {
      throw new Error('Polar Access token not found.')
    }
    return process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN!
  },
  server: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
})
