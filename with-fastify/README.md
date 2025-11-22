# Fastify + Polar Integration Example

A complete example of integrating [Polar](https://polar.sh) with Fastify using the [@polar-sh/fastify](https://polar.sh/docs/integrate/sdk/adapters/fastify) adapter.

## Features

This example demonstrates:

- ✅ **Checkout Flow** - Create payment checkouts with products
- ✅ **Customer Portal** - Allow customers to manage their orders and subscriptions
- ✅ **Webhooks** - Handle Polar webhook events (orders, subscriptions, etc.)

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Get your access token from https://polar.sh/settings
POLAR_ACCESS_TOKEN=your_access_token_here

# Webhook secret for validating incoming webhooks
POLAR_WEBHOOK_SECRET=your_webhook_secret_here

# Server environment: 'sandbox' for testing, 'production' for live
POLAR_SERVER=sandbox

# Application URL (used for redirects)
APP_URL=http://localhost:3000

# Server port
PORT=3000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open http://localhost:3000

## Available Routes

- `GET /` - Home page with links to all features
- `GET /checkout?products=PRODUCT_ID` - Polar checkout page
  - Query params: `products`, `customerId`, `customerEmail`, `customerName`, `metadata`
- `GET /portal?customerId=CUSTOMER_ID` - Customer portal for managing orders/subscriptions
- `POST /polar/webhooks` - Webhook endpoint for receiving Polar events
- `GET /success` - Success page after checkout completion

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

```bash
npm install
vc deploy
```

Make sure to set your environment variables in the Vercel dashboard.

## Documentation

- [Polar Fastify Adapter Documentation](https://polar.sh/docs/integrate/sdk/adapters/fastify)
- [Polar API Documentation](https://polar.sh/docs)
- [Fastify Documentation](https://fastify.dev)
