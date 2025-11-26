import { Polar } from "@polar-sh/sdk";
import nodemailer from "nodemailer";

// Configuration
const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN;
const PRODUCT_ID = process.env.PRODUCT_ID;
const POLAR_MODE = process.env.POLAR_MODE as "production" | "sandbox" | undefined | null;

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;

// Validate required environment variables
if (!POLAR_ACCESS_TOKEN)
  throw new Error("POLAR_ACCESS_TOKEN environment variable is required");
if (!PRODUCT_ID)
  throw new Error("PRODUCT_ID environment variable is required");
if (!EMAIL_USER || !EMAIL_PASS)
  throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required");

// Initialize Polar SDK
const polar = new Polar({ accessToken: POLAR_ACCESS_TOKEN, server: POLAR_MODE ?? "production" });

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

interface CustomerInfo {
  id: string;
  email: string;
  name?: string;
}

/**
 * Fetch all customers who have purchased a specific product
 */
async function getCustomersForProduct(productId: string): Promise<CustomerInfo[]> {
  console.log(`Fetching orders for product: ${productId}`);
  const customers = new Map<string, CustomerInfo>();
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await polar.orders.list({
      productId: productId,
      page,
      limit: 100,
    });
    if (!response.result)
      break;
    const { items, pagination } = response.result;
    // Extract unique customers from orders
    for (const order of items || []) {
      if (order.customer && order.customer.email) {
        customers.set(order.customer.id, {
          id: order.customer.id,
          email: order.customer.email,
          name: order.customer.name || undefined,
        });
      }
    }
    hasMore = pagination.totalCount > page * pagination.maxPage;
    page++;
  }
  console.log(`Found ${customers.size} unique customers`);
  return Array.from(customers.values());
}

/**
 * Create a customer portal session for a customer
 */
async function createCustomerSession(customerId: string): Promise<string> {
  const response = await polar.customerSessions.create({ customerId });
  return response.customerPortalUrl;
}

/**
 * Send email to a customer with their portal session link
 */
async function sendEmailToCustomer(
  customer: CustomerInfo,
  portalUrl: string
): Promise<void> {
  const mailOptions = {
    from: EMAIL_FROM,
    to: customer.email,
    subject: "Access Your Customer Portal",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome${customer.name ? `, ${customer.name}` : ''}!</h1>
          </div>
          <div class="content">
            <p>Thank you for your purchase! We've created a personalized customer portal for you.</p>
            
            <p>In your portal, you can:</p>
            <ul>
              <li>View your order history</li>
              <li>Manage your subscriptions</li>
              <li>Access your benefits and downloads</li>
              <li>Update your billing information</li>
            </ul>

            <div style="text-align: center;">
              <a href="${portalUrl}" class="button">Access Your Portal</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              This link is unique to you and will expire in 1 hour for security reasons.
            </p>
          </div>
          <div class="footer">
            <p>If you have any questions, please don't hesitate to reach out.</p>
          </div>
        </body>
      </html>
    `,
    text: `
Hello${customer.name ? ` ${customer.name}` : ''}!

Thank you for your purchase! We've created a personalized customer portal for you.

Access your portal here: ${portalUrl}

In your portal, you can:
- View your order history
- Manage your subscriptions
- Access your benefits and downloads
- Update your billing information

This link is unique to you and will expire in 1 hour for security reasons.

If you have any questions, please don't hesitate to reach out.
    `.trim(),
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${customer.email}`);
  } catch (error) {
    console.error(`✗ Failed to send email to ${customer.email}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("Starting email campaign...\n");
  // Verify email connection
  await transporter.verify();
  // console.log("✓ Email server connection verified\n");
  // Fetch customers for the product
  const customers = await getCustomersForProduct(PRODUCT_ID!);
  if (customers.length === 0) {
    console.log("No customers found for this product.");
    return;
  }
  console.log(`\nSending emails to ${customers.length} customers...\n`);
  // Process each customer
  let successCount = 0;
  let failureCount = 0;
  // Batch processing: process up to 50 customers in parallel per batch
  const BATCH_SIZE = 50;
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const batch = customers.slice(i, i + BATCH_SIZE);
    // Process all in the current batch in parallel
    await Promise.all(batch.map(async (customer) => {
      try {
        console.log(`Processing ${customer.email}...`);
        const portalUrl = await createCustomerSession(customer.id);
        // console.log(`Portal URL: ${portalUrl}`);
        await sendEmailToCustomer(customer, portalUrl);
        successCount++;
        // Optionally add a delay per customer if needed:
        // await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to process ${customer.email}:`, error);
        failureCount++;
      }
    }));
    // Add a delay after each batch to further reduce risk of rate limiting
    if (i + BATCH_SIZE < customers.length) await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("\n" + "=".repeat(50));
  console.log("Campaign completed!");
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log("=".repeat(50));
}

// Run the script
main();
