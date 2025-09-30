import { Polar } from '@polar-sh/sdk'

export async function getScope(log: boolean = true) {
  const accessToken = process.env.POLAR_OAT
  const servers: ('sandbox' | 'production')[] = ['sandbox', 'production']
  const [sandbox, production] = await Promise.allSettled(servers.map((server) => new Polar({ accessToken, server }).organizations.list({})))
  if (sandbox.status === 'fulfilled') {
    if (log) console.info('The token scope is of `sandbox`.')
    return 'sandbox'
  }
  if (log) console.info('The token scope is of `production`.')
  return 'production'
}

export async function setScope() {
  const scope = await getScope()
  const dotenvx = await import('@dotenvx/dotenvx')
  dotenvx.set('POLAR_MODE', scope, { encrypt: false })
}
