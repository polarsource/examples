package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	polargo "github.com/polarsource/polar-go"
	"github.com/polarsource/polar-go/models/components"
	"github.com/polarsource/polar-go/models/operations"
	svix "github.com/svix/svix-webhooks/go"
)

type Config struct {
	PolarAccessToken   string
	PolarWebhookSecret string
	PolarMode          string
	PolarSuccessURL    string
	Port               string
}

func loadConfig() (*Config, error) {
	// Load .env file
	_ = godotenv.Load()

	config := &Config{
		PolarAccessToken:   os.Getenv("POLAR_ACCESS_TOKEN"),
		PolarWebhookSecret: os.Getenv("POLAR_WEBHOOK_SECRET"),
		PolarMode:          os.Getenv("POLAR_MODE"),
		PolarSuccessURL:    os.Getenv("POLAR_SUCCESS_URL"),
		Port:               os.Getenv("PORT"),
	}

	if config.PolarMode == "" {
		config.PolarMode = "production"
	}
	if config.Port == "" {
		config.Port = "8080"
	}

	// Validate required fields
	if config.PolarAccessToken == "" {
		return nil, fmt.Errorf("POLAR_ACCESS_TOKEN is required")
	}
	if config.PolarWebhookSecret == "" {
		return nil, fmt.Errorf("POLAR_WEBHOOK_SECRET is required")
	}

	return config, nil
}

func main() {
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	// Initialize Polar client
	polarClient := polargo.New(
		polargo.WithSecurity(config.PolarAccessToken),
	)
	if config.PolarMode == "sandbox" {
		polarClient = polargo.New(
			polargo.WithSecurity(config.PolarAccessToken),
			polargo.WithServerURL("https://sandbox-api.polar.sh"),
		)
	}

	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		ctx := context.Background()

		// Fetch products
		products, err := polarClient.Products.List(ctx, operations.ProductsListRequest{
			IsArchived: polargo.Bool(false),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Error fetching products: %v", err))
		}

		html := `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-white flex flex-col items-center justify-center gap-16 min-h-screen">
    <div class="w-[360px] max-w-[90%] flex flex-col gap-3">`

		if products.ListResourceProduct != nil {
			for _, product := range products.ListResourceProduct.Items {
				html += fmt.Sprintf(`
      <a 
        href="/checkout?products=%s" 
        target="_blank"
        class="block text-center px-4 py-3 border rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-900 transition"
      >
        Buy %s
      </a>`, product.ID, product.Name)
			}
		}

		html += `
    </div>
    <form action="/portal" method="get" class="flex gap-2">
      <input 
        required
        type="email" 
        name="email" 
        placeholder="Email"
        class="px-4 py-2 text-base border rounded-lg w-[260px] focus:outline-none focus:border-black"
      />
      <button 
        type="submit" 
        class="px-6 py-2 text-base bg-black text-white rounded-lg hover:opacity-80 transition"
      >
        Continue
      </button>
    </form>
  </body>
</html>`

		c.Set("Content-Type", "text/html; charset=utf-8")
		return c.Status(fiber.StatusOK).Send([]byte(html))
	})

	// Route: POST /polar/webhooks
	app.Post("/polar/webhooks", func(c *fiber.Ctx) error {
		bodyBytes := c.Body()

		webhookID := c.Get("webhook-id")
		webhookTimestamp := c.Get("webhook-timestamp")
		webhookSignature := c.Get("webhook-signature")
		base64Secret := base64.StdEncoding.EncodeToString([]byte(config.PolarWebhookSecret))

		// Verify webhook
		wh, err := svix.NewWebhook(base64Secret)
		if err != nil {
			log.Printf("Error creating webhook verifier: %v", err)
			return c.Status(fiber.StatusForbidden).SendString("Error verifying webhook")
		}

		headers := http.Header{}
		headers.Set("webhook-id", webhookID)
		headers.Set("webhook-timestamp", webhookTimestamp)
		headers.Set("webhook-signature", webhookSignature)

		err = wh.Verify(bodyBytes, headers)
		if err != nil {
			log.Printf("Webhook verification failed: %v", err)
			return c.Status(fiber.StatusForbidden).SendString("Webhook verification failed")
		}

		return c.Status(fiber.StatusOK).Send(bodyBytes)
	})

	// Route: GET /checkout
	app.Get("/checkout", func(c *fiber.Ctx) error {
		ctx := context.Background()

		productID := c.Query("products")
		if productID == "" {
			return c.Status(fiber.StatusBadRequest).SendString("Missing products parameter")
		}
		// Fiber's c.Query only returns one value. To handle multiple:
		// We'll stick to one for this simple example or use a custom parser.
		// with-golang-gin used QueryArray, let's see how Fiber handles it.
		// Actually, let's just support one for simplicity as per most examples.
		productIDs := []string{productID}

		successURL := config.PolarSuccessURL
		if successURL == "" {
			successURL = fmt.Sprintf("http://%s/", c.Hostname())
		}

		// Create checkout session
		checkoutSession, err := polarClient.Checkouts.Create(ctx, components.CheckoutCreate{
			Products:   productIDs,
			SuccessURL: polargo.String(successURL),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Error creating checkout: %v", err))
		}

		// Redirect to checkout URL
		if checkoutSession.Checkout != nil {
			return c.Redirect(checkoutSession.Checkout.URL, fiber.StatusFound)
		} else {
			return c.Status(fiber.StatusInternalServerError).SendString("Checkout URL not available")
		}
	})

	// Route: GET /portal
	app.Get("/portal", func(c *fiber.Ctx) error {
		ctx := context.Background()

		email := c.Query("email")
		if email == "" {
			return c.Status(fiber.StatusBadRequest).SendString("Missing email parameter")
		}

		// Find customer by email
		customers, err := polarClient.Customers.List(ctx, operations.CustomersListRequest{
			Email: polargo.String(email),
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Error fetching customer: %v", err))
		}

		if customers.ListResourceCustomer == nil || len(customers.ListResourceCustomer.Items) == 0 {
			return c.Status(fiber.StatusNotFound).SendString("Customer not found")
		}

		// Create customer portal session
		session, err := polarClient.CustomerSessions.Create(ctx, operations.CreateCustomerSessionsCreateCustomerSessionCreateCustomerSessionCustomerIDCreate(
			components.CustomerSessionCustomerIDCreate{
				CustomerID: customers.ListResourceCustomer.Items[0].ID,
			},
		))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString(fmt.Sprintf("Error creating portal session: %v", err))
		}

		// Redirect to customer portal
		if session.CustomerSession != nil {
			return c.Redirect(session.CustomerSession.CustomerPortalURL, fiber.StatusFound)
		} else {
			return c.Status(fiber.StatusInternalServerError).SendString("Customer portal URL not available")
		}
	})

	// Start server
	port := config.Port
	if _, err := strconv.Atoi(port); err != nil {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
