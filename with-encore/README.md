![](../logo.svg)

# Getting started with Polar and Encore

## Clone the repository

```bash
npx degit polarsource/examples/with-encore ./with-encore
```

## Prerequisites

- [Encore CLI](https://encore.dev/docs/ts/install) installed
- A [Polar](https://polar.sh) account with an access token and a product created

## How to use

1. Run the command below to install project dependencies:

```
npm install
```

2. Set up your Polar secrets:

```
encore secret set --type local POLAR_ACCESS_TOKEN
encore secret set --type local POLAR_WEBHOOK_SECRET
```

3. Run the Encore application using the following command:

```
encore run
```

4. To receive webhooks locally, use the [Polar CLI](https://polar.sh/docs/integrate/webhooks/locally):

```
polar listen http://localhost:4000/polar/webhooks
```
