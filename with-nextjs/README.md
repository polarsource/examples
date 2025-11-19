<img width="255" height="75" alt="image" src="https://github.com/user-attachments/assets/5f6f176d-661a-45ed-b661-b4d8383e63c6" />

#  Getting started with Polar and Next.js 

## Clone the repository

```bash
npx degit polarsource/examples/with-nextjs ./with-nextjs
```

## How to use

Run the command below to copy the .env.example file :

```bash
cp .env.example .env
```

```bash
# https://docs.polar.sh/integrate/oat
POLAR_ACCESS_TOKEN="polar_oat_..."
# https://docs.polar.sh/integrate/webhooks/endpoints#setup-webhooks
POLAR_WEBHOOK_SECRET="polar_whs_..."
# Polar server mode - production or sandbox
POLAR_MODE="sandbox"
# client url - this is the URL the customer would be led to if they purchase something.
POLAR_SUCCESS_URL="http://localhost:3000"
```

Run the command below to install project dependencies:

```bash
npm install
```

Run the Next.js application using the following command:

```bash
npm run dev
```
