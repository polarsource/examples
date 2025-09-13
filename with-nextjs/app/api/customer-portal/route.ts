import { polar } from '@/app/polar'
import { NextRequest, NextResponse } from 'next/server'

export async function createCustomer(email: string) {
  try {
    // existing user fetch logic
    // in this example we are not using database, so you can only get the portal-once because 2nd time we dont have any logic to fecth customerId.

    const customer = await polar.customers.create({
      email: email,
    })
    return { customer_id: customer?.id, message: 'customer created succesfully.' }
  } catch (error) {
    return { customer_id: null, message: 'customer creation unsuccesfull.' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    let { email }: any = req.body

    if (!email) {
      email = searchParams.get('email')
    }

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const { customer_id, message }: any = await createCustomer(email)
    if (!customer_id) {
      return NextResponse.json({ message, customerId: customer_id }, { status: 400 })
    }
    const { customerPortalUrl } = await polar.customerSessions.create({
      customerId: customer_id,
    })

    return NextResponse.json({ customerPortalUrl, customerId: customer_id, message }, { status: 201 })
  } catch (error) {
    console.log('Error in customer portal.', error)
    return NextResponse.json({ message: 'Error in customer portal.' }, { status: 500 })
  }
}
