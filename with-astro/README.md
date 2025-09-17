![](../logo.svg)

# Getting Started with Polar and Astro

This repo is a demonstration of the integration of Polar features such as Webhooks, Customer Portal and Checkout creation organization in Astro.

## Prerequisites

- Node.js installed on your system
- Your POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET, SUCCESS_URL  and SANDBOX_POLAR_ACCESS_TOKEN, SANDBOX_POLAR_WEBHOOK_SECRET, SANDBOX_POLAR_SUCCESS_URL, and POLAR_MODE
> this is an optional configuration, adjust based on your needs



## 1. Clone the repository

```bash
npx degit polarsource/examples/with-astro ./with-astro
```

## 2. Install dependencies:

```bash
npm install
```

## 3. Configure environment variables:

Create a `.env` file in the project root with your Polar credentials:

```bash
cp .env.example .env
```

Add your Polar API credentials to the `.env` file:

```env
POLAR_ACCESS_TOKEN=

POLAR_WEBHOOK_SECRET=

POLAR_SUCCESS_URL=

SANDBOX_POLAR_ACCESS_TOKEN=

SANDBOX_POLAR_WEBHOOK_SECRET=

SANDBOX_POLAR_SUCCESS_URL=

POLAR_MODE=
```

You can find your POLAR_ACCESS_TOKEN and POLAR_WEBHOOK_SECRET variables in your Polar dashboard settings. see `.env.example`

## 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:4321` to see the demo interface.

## Configuration

### Polar Dashboard Setup

1. **Create Products**: Set up products in your Polar dashboard
2. **Configure Webhooks**: Add webhook endpoint `https://your-domain.com/api/webhooks/polar`
3. **Get Credentials**: Copy your access token and webhook secret

## Deployment

### Vercel (Recommended)

1. Add the vercel adapter to your projects, [link here](https://docs.astro.build/en/guides/integrations-guide/vercel/#installation)
1. Connect your repository to Vercel
1. Add environment variables in Vercel dashboard
1. Deploy automatically on push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/polarsource/examples/tree/main/with-astro&env=POLAR_ACCESS_TOKEN,POLAR_WEBHOOK_SECRET,POLAR_SUCCESS_URL,SANDBOX_POLAR_ACCESS_TOKEN,SANDBOX_POLAR_WEBHOOK_SECRET,SANDBOX_POLAR_SUCCESS_URL,POLAR_MODE&envDescription=Configure%20your%20Polar%20API%20credentials%20and%20mode.&envLink=https://docs.polar.sh/integrate/webhooks/endpoints#setup-webhooks)

### Other Platforms

The project works with any platform that supports Astro:

> Ensure to add the respective adapter for those supported to the project, before deploying to that platform. [Astro deployment guide](https://docs.astro.build/en/guides/deploy/)

- Cloudflare
- Netlify
- Node etc.

## 5. Testing

### Local Testing

1. Use Polar's sandbox environment
2. Test with sandbox product IDs
3. Monitor webhook events payloads in your console and
4. Verify your access tokens by running the `validateAccessToken.ts` test in `./scripts`

```bash
npm run validate-token
```

### Webhook Testing

1. Use tools like ngrok for local webhook testing
2. Configure webhook URL in Polar dashboard
3. Configure `vite.server.allowedhosts` in `astro.config.mjs` to allow it.
4. Trigger test events from Polar dashboard
