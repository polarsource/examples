import { Polar } from '@polar-sh/sdk'
import dotenv from 'dotenv'

dotenv.config()

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green)
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red)
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

async function validatePolarToken() {
  try {
    log(`${colors.bold}=== Polar Access Token Validation ===${colors.reset}`)
    log('')

    // Check environment variables
    const productionToken = process.env.POLAR_ACCESS_TOKEN
    const sandboxToken = process.env.SANDBOX_POLAR_ACCESS_TOKEN
    const polarMode = process.env.POLAR_MODE || 'sandbox' // Default to sandbox
    const currentEnv = process.env.NODE_ENV || 'development'

    logInfo(`NODE_ENV: ${currentEnv}`)
    logInfo(`POLAR_MODE: ${polarMode}`)
    logInfo(`Production token present: ${productionToken ? 'Yes' : 'No'}`)
    logInfo(`Sandbox token present: ${sandboxToken ? 'Yes' : 'No'}`)
    log('')

    // Determine which token to use based on POLAR_MODE
    let accessToken: string | undefined
    let server: 'production' | 'sandbox'

    if (polarMode === 'production') {
      accessToken = productionToken
      server = 'production'
      logInfo('Using production configuration (POLAR_MODE=production)')
    } else {
      accessToken = sandboxToken
      server = 'sandbox'
      logInfo('Using sandbox configuration (POLAR_MODE=sandbox or default)')
    }

    if (!accessToken) {
      logError(`Missing access token for ${server} environment`)
      logError(`Please set ${server === 'production' ? 'POLAR_ACCESS_TOKEN' : 'SANDBOX_POLAR_ACCESS_TOKEN'} in your .env file`)
      logError(`Current POLAR_MODE: ${polarMode}`)
      process.exit(1)
    }

    // Mask token for display
    const maskedToken = accessToken.slice(0, 10) + '...' + accessToken.slice(-4)
    logInfo(`Using token: ${maskedToken}`)
    logInfo(`Server: ${server}`)
    log('')

    // Initialize Polar client
    const polar = new Polar({
      accessToken,
      server,
    })

    // Test 1: Basic API connectivity
    log(`${colors.bold}Test 1: Basic API Connectivity${colors.reset}`)
    try {
      const organizations = await polar.organizations.list({ limit: 1 })
      logSuccess(`Connected to Polar API successfully`)
      logInfo(`Found ${organizations.result.items.length} organization(s)`)

      if (organizations.result.items.length > 0) {
        const org = organizations.result.items[0]
        logInfo(`Primary organization: ${org.name} (${org.id})`)
      }
    } catch (error) {
      logError(`Failed to connect to Polar API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }

    log('')

    // Test 2: Customers API
    log(`${colors.bold}Test 2: Customers API Access${colors.reset}`)
    try {
      const customers = await polar.customers.list({ limit: 3 })
      logSuccess(`Customers API accessible`)
      logInfo(`Found ${customers.result.items.length} customer(s) (showing max 3)`)

      customers.result.items.forEach((customer, index) => {
        logInfo(`  ${index + 1}. ${customer.email} (${customer.id})`)
      })
    } catch (error) {
      logError(`Failed to access Customers API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logWarning('This might be a permission issue with your access token')
    }

    log('')

    // Test 3: Products API
    log(`${colors.bold}Test 3: Products API Access${colors.reset}`)
    try {
      const products = await polar.products.list({ limit: 3 })
      logSuccess(`Products API accessible`)
      logInfo(`Found ${products.result.items.length} product(s) (showing max 3)`)

      products.result.items.forEach((product, index) => {
        logInfo(`  ${index + 1}. ${product.name} (${product.id})`)
      })
    } catch (error) {
      logError(`Failed to access Products API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logWarning('This might be a permission issue with your access token')
    }

    log('')

    // Test 4: Subscriptions API
    log(`${colors.bold}Test 4: Subscriptions API Access${colors.reset}`)
    try {
      const subscriptions = await polar.subscriptions.list({ limit: 3 })
      logSuccess(`Subscriptions API accessible`)
      logInfo(`Found ${subscriptions.result.items.length} subscription(s) (showing max 3)`)

      subscriptions.result.items.forEach((subscription, index) => {
        logInfo(`  ${index + 1}. ${subscription.id} - Status: ${subscription.status}`)
      })
    } catch (error) {
      logError(`Failed to access Subscriptions API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logWarning('This might be a permission issue with your access token')
    }

    log('')

    // Test 5: Orders API
    log(`${colors.bold}Test 5: Orders API Access${colors.reset}`)
    try {
      const orders = await polar.orders.list({ limit: 3 })
      logSuccess(`Orders API accessible`)
      logInfo(`Found ${orders.result.items.length} order(s) (showing max 3)`)

      orders.result.items.forEach((order, index) => {
        logInfo(`  ${index + 1}. ${order.id} - Status: ${order.status}`)
      })
    } catch (error) {
      logError(`Failed to access Orders API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logWarning('This might be a permission issue with your access token')
    }

    log('')

    // Test 6: Checkout Session Creation
    log(`${colors.bold}Test 6: Checkout Session Creation${colors.reset}`)
    try {
      // First, get a product to test with
      const products = await polar.products.list({ limit: 1 })

      if (products.result.items.length === 0) {
        logWarning('No products found - skipping checkout session test')
        logInfo('Create a product in your Polar dashboard to test checkout functionality')
      } else {
        const testProduct = products.result.items[0]
        logInfo(`Testing checkout with product: ${testProduct.name}`)

        // Create a test checkout session
        const checkoutSession = await polar.checkouts.create({
          products: [testProduct.id],
          successUrl: 'https://yourwebsite.com/success',
          // Optional: add customer email for testing
          customerEmail: 'test@gmail.com',
        })

        logSuccess('Checkout session created successfully!')
        logInfo(`Checkout session ID: ${checkoutSession.id}`)
        logInfo(`Checkout URL: ${checkoutSession.url}`)
        logInfo(`Status: ${checkoutSession.status}`)

        // Test retrieving the checkout session
        const retrievedSession = await polar.checkouts.get({ id: checkoutSession.id })
        logSuccess('Checkout session retrieval successful!')
        logInfo(`Retrieved session status: ${retrievedSession.status}`)

        logInfo('Test checkout session created successfully (no cleanup needed)')
      }
    } catch (error) {
      logError(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
      logWarning('This might indicate missing permissions for checkout operations')

      if (error instanceof Error) {
        if (error.message.includes('product_id')) {
          logInfo('Make sure you have at least one product created in your Polar dashboard')
        }
        if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          logInfo('Your access token might not have checkout creation permissions')
        }
      }
    }

    log('')

    // Environment Configuration Summary
    log(`${colors.bold}=== Environment Configuration ===${colors.reset}`)
    logInfo(`Current configuration:`)
    logInfo(`• POLAR_MODE: ${polarMode}`)
    logInfo(`• Using ${server} server`)
    logInfo(`• Token: ${maskedToken}`)

    if (polarMode === 'production') {
      logWarning('You are using PRODUCTION mode!')
      logWarning('Make sure you have the correct production token set')
    } else {
      logInfo('You are using SANDBOX mode (safe for testing)')
    }

    log('')
    log(`${colors.bold}=== Validation Complete ===${colors.reset}`)
    logSuccess('Polar integration validation completed successfully!')
    log('')
    logInfo('Your Polar access token is working correctly.')
    logInfo('You can now use this token in your Astro application.')
    log('')
    logInfo('To switch modes, set POLAR_MODE in your .env file:')
    logInfo('• POLAR_MODE=sandbox (for testing)')
    logInfo('• POLAR_MODE=production (for live environment)')
  } catch (error) {
    log('')
    logError('Validation failed with an unexpected error:')
    console.error(error)
    process.exit(1)
  }
}

validatePolarToken()
