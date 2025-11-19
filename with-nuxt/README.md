![](../logo.svg)

# Getting Started with Polar and Nuxt

## Clone the repository

```bash
npx degit polarsource/examples/with-nuxt ./with-nuxt
```

## How to use

1. Run the command below to copy the `.env.example` file:

```
cp .env.example .env
```

2. Run the command below to install project dependencies:

```
npm install
```

3. Run the Nuxt application using the following command:

```
npm run dev
```

### Webhook Testing

1. Use tools like ngrok for local webhook testing
2. Configure webhook URL in Polar dashboard
3. Configure `vite.server.allowedhosts` in `nuxt.config.ts` to allow it.
4. Trigger test events from Polar dashboard
