import { Checkout } from '@polar-sh/remix'

export const loader = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.POLAR_SUCCESS_URL!,
  server: process.env.POLAR_MODE as 'sandbox' | 'production',
  theme: 'dark',
})
