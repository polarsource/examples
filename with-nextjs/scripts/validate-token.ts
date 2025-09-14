import { Polar } from '@polar-sh/sdk'
import dotenv from 'dotenv'

dotenv.config()

async function validateAccessToken() {
  const accessToken = process.env.NEXT_PUBLIC_SANDBOX_POLAR_ACCESS_TOKEN || process.env.POLAR_ACCESS_TOKEN

  if (!accessToken) {
    console.error(' Missing POLAR_ACCESS_TOKEN in environment variables.')
    process.exit(1)
  }

  try {
    const servers: Array<'sandbox' | 'production'> = ['sandbox', 'production']

    for (const server of servers) {
      try {
        const client = new Polar({
          accessToken,
          server,
        })

        const products = await client.products.list({ limit: 1 })

        if (products?.result.items.length >= 0) {
          console.log(` Polar access token is valid for ${server} mode`)
        }
        return
      } catch (err: any) {
        console.warn(`⚠️ Failed to validate token in ${server} mode:`, err.message || err)
      }
    }
  } catch (err: any) {
    console.error(' Polar access token validation failed:', err.message || err)
    process.exit(1)
  }
}

validateAccessToken()
