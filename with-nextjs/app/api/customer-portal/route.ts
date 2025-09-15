// app/api/customer-portal/route.ts

import { polar } from '@/app/polar'
import { NextRequest, NextResponse } from 'next/server'

async function getOrCreateCustomer(email: string) {
  try {
    const existingCustomers = await polar.customers.list({ email: email, limit: 1 })

    if (existingCustomers.result.items.length > 0) {
      const customerId = existingCustomers.result.items[0].id
      return { customer_id: customerId, message: 'Customer found.' }
    }

    const newCustomer = await polar.customers.create({ email })
    return {
      customer_id: newCustomer?.id,
      message: 'Customer created successfully.',
    }
  } catch (error) {
    console.error('Failed to get or create customer', error)
    return {
      customer_id: null,
      message: 'Customer operation was unsuccessful.',
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    let email: string | null = null

    try {
      const body = await req.json()
      email = body.email
    } catch (error) { }

    if (!email) {
      email = req.nextUrl.searchParams.get('email')
    }

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 },
      )
    }

    const { customer_id, message }: any = await getOrCreateCustomer(email)
    if (!customer_id) {
      return NextResponse.json(
        { message, customerId: customer_id },
        { status: 400 },
      )
    }

    const customerSession = await polar.customerSessions.create({
      customerId: customer_id,
    })

    const portalUrl = customerSession.customerPortalUrl

    if (!portalUrl || typeof portalUrl !== 'string') {
      console.error(
        'Error: customerPortalUrl from Polar SDK was not a string.',
        portalUrl,
      )
      return NextResponse.json(
        { message: 'Internal server error: Could not retrieve a valid portal URL.' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { customerPortalUrl: portalUrl, customerId: customer_id, message },
      { status: 201 },
    )
  } catch (error) {
    console.log('Error in customer portal.', error)
    return NextResponse.json(
      { message: 'Error in customer portal.' },
      { status: 500 },
    )
  }
}

