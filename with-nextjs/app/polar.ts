import { Polar } from '@polar-sh/sdk'

export const api = new Polar({
  accessToken: (): any => {
    console.log('token', process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN)
    return process.env.NEXT_PUBLIC_POLAR_ACCESS_TOKEN!
  },
  server: 'sandbox', // example using sandbox
})
