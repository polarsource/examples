import { Polar } from '@polar-sh/sdk'

export const polar = new Polar({
  accessToken: (): any => {
    const token = process.env.POLAR_MODE === 'production' ? process.env.NEXT_PUBLIC_PRODUCTION_POLAR_ACCESS_TOKEN : process.env.NEXT_PUBLIC_SANDBOX_POLAR_ACCESS_TOKEN

    if (!token) {
      throw new Error(`❌ ${process.env.POLAR_MODE === 'production' ? 'NEXT_PUBLIC_PRODUCTION_POLAR_ACCESS_TOKEN' : 'NEXT_PUBLIC_SANDBOX_POLAR_ACCESS_TOKEN'} token not found.`)
    }

    return token
  },
  // server: 'sandbox',
  server: 'production',
})
