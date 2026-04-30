# Polar Go + Fiber Example

This example demonstrates how to integrate Polar into a Go application using the [Fiber](https://gofiber.io/) web framework and the [`polar-go`](https://github.com/polarsource/polar-go) SDK.

## Features

- List products from Polar
- Create checkout sessions
- Handle webhooks (with verification via Svix)
- Customer portal integration

## Getting Started

1. Copy `.env.example` to `.env` and fill in your Polar credentials.
2. Install dependencies:
   ```bash
   go mod tidy
   ```
3. Run the application:
   ```bash
   go run main.go
   ```
