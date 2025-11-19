![](../logo.svg)

# Getting Started with Polar and Astro

https://polar-with-astro.vercel.app

This repo is a demonstration of the integration of Polar features such as Webhooks, Customer Portal and Checkout creation organization in Astro.

## Prerequisites

- Node.js installed on your system
- Your POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, SUCCESS_URL, and POLAR_MODE
  > this is an optional configuration, adjust based on your needs

## Clone the repository

```bash
npx degit polarsource/examples/with-astro ./with-astro
```

## Usage

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the project root with your Polar credentials:

```bash
cp .env.example .env
```

3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to see the demo interface.

### Webhook Testing

1. Use tools like ngrok for local webhook testing
2. Configure webhook URL in Polar dashboard
3. Configure `vite.server.allowedhosts` in `astro.config.mjs` to allow it.
4. Trigger test events from Polar dashboard
