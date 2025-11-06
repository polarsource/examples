// app/routes.ts
import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/_index.tsx'),
  route('polar/checkout', 'routes/checkout.tsx'),
  route('polar/customer-portal', 'routes/customer-portal.tsx'),
  route('polar/webhook', 'routes/webhook.tsx'),
  route('success', 'routes/success.tsx'),
] satisfies RouteConfig
