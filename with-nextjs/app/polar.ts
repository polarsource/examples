import { Polar } from '@polar-sh/sdk'

let polarInstance: Polar | null = null

const createPolarInstance = () => {
  const token = process.env.POLAR_MODE === 'production' ? process.env.POLAR_ACCESS_TOKEN : process.env.SANDBOX_POLAR_ACCESS_TOKEN
  if (!token) {
    throw new Error(`❌ Missing ${process.env.POLAR_MODE === 'production' ? 'POLAR_ACCESS_TOKEN' : 'SANDBOX_POLAR_ACCESS_TOKEN'}`)
  }

  return new Polar({
    accessToken: token,
    server: process.env.POLAR_MODE === 'production' ? 'production' : 'sandbox',
  })
}

export const polar = (() => {
  if (!polarInstance) {
    polarInstance = createPolarInstance()
  }
  return polarInstance
})()

export const successUrl = process.env.POLAR_MODE === 'production' ? process.env.PROD_SUCCESS_URL : process.env.DEV_SUCCESS_URL
