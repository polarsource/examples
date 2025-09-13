import { Polar } from '@polar-sh/sdk'

const server = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'

export const polar = new Polar({
  accessToken: (): any => {
    const token = process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PRODUCTION_POLAR_ACCESS_TOKEN : process.env.NEXT_PUBLIC_SANDBOX_POLAR_ACCESS_TOKEN

    if (!token) {
      throw new Error('❌ Polar access token not found.')
    }

    return token
  },
  server: server,
})
