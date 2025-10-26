import { Polar } from '@polar-sh/sdk'

let polarInstance: Polar | null = null

const getScope = async (): Promise<'sandbox' | 'production'> => {
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error(`❌ Missing POLAR_ACCESS_TOKEN.`)
  }

  const servers: ('sandbox' | 'production')[] = ['sandbox', 'production']
  const [sandbox, production] = await Promise.allSettled(servers.map((server) => new Polar({ accessToken, server }).organizations.list({})))

  if (sandbox.status === 'fulfilled') {
    return 'sandbox'
  } else if (production.status === 'fulfilled') {
    return 'production'
  } else {
    throw new Error('❌ POLAR_ACCESS_TOKEN is invalid for both sandbox and production')
  }
}

export default async function setScope() {
  if (polarInstance) return polarInstance

  const scope = await getScope()
  const accessToken = process.env.POLAR_ACCESS_TOKEN
  const dotenvx = await import('@dotenvx/dotenvx')
  dotenvx.set('POLAR_MODE', scope, { encrypt: false })
  polarInstance = new Polar({ accessToken, server: scope })

  return polarInstance
}

export const getPolar = async (): Promise<Polar | null> => {
  return await setScope()
}
export const successUrl = process.env.POLAR_SUCCESS_URL
