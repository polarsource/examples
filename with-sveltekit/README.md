![](../logo.svg)

# Getting Started with Polar and SvelteKit

## Clone the repository

```bash
npx degit polarsource/examples/with-sveltekit ./with-sveltekit
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

3. Run the SvelteKit application using the following command:

```
npm run dev
```

### Webhook Testing

1. Use tools like ngrok for local webhook testing
2. Configure webhook URL in Polar dashboard
3. Configure `vite.server.allowedhosts` in `vite.config.js` to allow it.
4. Trigger test events from Polar dashboard
