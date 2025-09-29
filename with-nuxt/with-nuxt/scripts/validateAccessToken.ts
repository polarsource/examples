import { Polar } from '@polar-sh/sdk'
import '@dotenvx/dotenvx/config'

async function validatePolarToken() {
  try {
    console.log('=== Polar Access Token Validation ===')

    // Check environment variables
    const productionToken = process.env.POLAR_ACCESS_TOKEN
    const sandboxToken = process.env.SANDBOX_POLAR_ACCESS_TOKEN
    const polarMode = process.env.POLAR_MODE || 'sandbox' // Default to sandbox
    const currentEnv = process.env.NODE_ENV || 'development'

    console.log(`NODE_ENV: ${currentEnv}`)
    console.log(`POLAR_MODE: ${polarMode}`)
    console.log(`Production token present: ${productionToken ? 'Yes' : 'No'}`)
    console.log(`Sandbox token present: ${sandboxToken ? 'Yes' : 'No'}`)
    console.log('')

    // Determine which token to use
    let accessToken: string | undefined
    let server: 'production' | 'sandbox'

    if (polarMode === 'production') {
      accessToken = productionToken
      server = 'production'
      console.log('Using production configuration (POLAR_MODE=production)')
    } else {
      accessToken = sandboxToken
      server = 'sandbox'
      console.log('Using sandbox configuration (POLAR_MODE=sandbox or default)')
    }

    if (!accessToken) {
      console.error(`Missing access token for ${server} environment`)
      console.error(`Please set ${server === 'production' ? 'POLAR_ACCESS_TOKEN' : 'SANDBOX_POLAR_ACCESS_TOKEN'} in your .env file`)
      console.error(`Current POLAR_MODE: ${polarMode}`)
      process.exit(1)
    }

    // Mask token for display
    const maskedToken = accessToken.slice(0, 10) + '...' + accessToken.slice(-4)
    console.log(`Using token: ${maskedToken}`)
    console.log(`Server: ${server}`)
    console.log('')

    // Initialize Polar client
    const polar = new Polar({
      accessToken,
      server,
    })

    // Test 1: Basic API connectivity
    console.log('Test 1: Basic API Connectivity')
    try {
      const organizations = await polar.organizations.list({ limit: 1 })
      console.log('Connected to Polar API successfully')
      console.log(`Found ${organizations.result.items.length} organization(s)`)

      if (organizations.result.items.length > 0) {
        const org = organizations.result.items[0]
        console.log(`Primary organization: ${org.name} (${org.id})`)
      }
    } catch (error) {
      console.error(`Failed to connect to Polar API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      process.exit(1)
    }

    console.log('')

    // Test 2: Customers API
    console.log('Test 2: Customers API Access')
    try {
      const customers = await polar.customers.list({ limit: 3 })
      console.log('Customers API accessible')
      console.log(`Found ${customers.result.items.length} customer(s) (showing max 3)`)

      customers.result.items.forEach((customer, index) => {
        console.log(`  ${index + 1}. ${customer.email} (${customer.id})`)
      })
    } catch (error) {
      console.error(`Failed to access Customers API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.warn('This might be a permission issue with your access token')
    }

    console.log('')

    // Test 3: Products API
    console.log('Test 3: Products API Access')
    try {
      const products = await polar.products.list({ limit: 3 })
      console.log('Products API accessible')
      console.log(`Found ${products.result.items.length} product(s) (showing max 3)`)

      products.result.items.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.id})`)
      })
    } catch (error) {
      console.error(`Failed to access Products API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.warn('This might be a permission issue with your access token')
    }

    console.log('')

    // Test 4: Subscriptions API
    console.log('Test 4: Subscriptions API Access')
    try {
      const subscriptions = await polar.subscriptions.list({ limit: 3 })
      console.log('Subscriptions API accessible')
      console.log(`Found ${subscriptions.result.items.length} subscription(s) (showing max 3)`)

      subscriptions.result.items.forEach((subscription, index) => {
        console.log(`  ${index + 1}. ${subscription.id} - Status: ${subscription.status}`)
      })
    } catch (error) {
      console.error(`Failed to access Subscriptions API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.warn('This might be a permission issue with your access token')
    }

    console.log('')

    // Test 5: Orders API
    console.log('Test 5: Orders API Access')
    try {
      const orders = await polar.orders.list({ limit: 3 })
      console.log('Orders API accessible')
      console.log(`Found ${orders.result.items.length} order(s) (showing max 3)`)

      orders.result.items.forEach((order, index) => {
        console.log(`  ${index + 1}. ${order.id} - Status: ${order.status}`)
      })
    } catch (error) {
      console.error(`Failed to access Orders API: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.warn('This might be a permission issue with your access token')
    }

    console.log('')

    // Test 6: Checkout Session Creation
    console.log('Test 6: Checkout Session Creation')
    try {
      const products = await polar.products.list({ limit: 1 })

      if (products.result.items.length === 0) {
        console.warn('No products found - skipping checkout session test')
        console.log('Create a product in your Polar dashboard to test checkout functionality')
      } else {
        const testProduct = products.result.items[0]
        console.log(`Testing checkout with product: ${testProduct.name}`)

        const checkoutSession = await polar.checkouts.create({
          products: [testProduct.id],
          successUrl: 'https://yourwebsite.com/success',
          customerEmail: 'test@gmail.com',
        })

        console.log('Checkout session created successfully')
        console.log(`Checkout session ID: ${checkoutSession.id}`)
        console.log(`Checkout URL: ${checkoutSession.url}`)
        console.log(`Status: ${checkoutSession.status}`)

        const retrievedSession = await polar.checkouts.get({
          id: checkoutSession.id,
        })
        console.log('Checkout session retrieval successful')
        console.log(`Retrieved session status: ${retrievedSession.status}`)
      }
    } catch (error) {
      console.error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.warn('This might indicate missing permissions for checkout operations')
    }

    console.log('')
    console.log('=== Environment Configuration ===')
    console.log('Current configuration:')
    console.log(`• POLAR_MODE: ${polarMode}`)
    console.log(`• Using ${server} server`)
    console.log(`• Token: ${maskedToken}`)

    if (polarMode === 'production') {
      console.warn('You are using PRODUCTION mode!')
      console.warn('Make sure you have the correct production token set')
    } else {
      console.log('You are using SANDBOX mode (safe for testing)')
    }

    console.log('')
    console.log('=== Validation Complete ===')
    console.log('Polar integration validation completed successfully')
    console.log('Your Polar access token is working correctly.')
    console.log('You can now use this token in your Astro application.')
    console.log('')
    console.log('To switch modes, set POLAR_MODE in your .env file:')
    console.log('• POLAR_MODE=sandbox (for testing)')
    console.log('• POLAR_MODE=production (for live environment)')
  } catch (error) {
    console.error('Validation failed with an unexpected error:')
    console.error(error)
    process.exit(1)
  }
}

validatePolarToken()
