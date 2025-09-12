import { api } from '@/app/polar'
import { NextRequest, NextResponse } from 'next/server'

export async function createCustomer(email: string) {
  try {
    // existing user fetch logic
    // in this example we are not using database, so you can only get the portal-once because 2nd time we dont have any logic to fecth customerId.
    
    const customer = await api.customers.create({
      email: email,
    })

    return { customer_id: customer?.id, message: 'customer created succesfully.' }
  } catch (error) {
    console.log('Error in creating Customer.', error)
    return { customer_id: null, message: 'customer creation unsuccesfull.' }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const email = searchParams.get('email')
    if (!email) {
      throw new Error('Email query parameter is required')
    }

    const { customer_id, message }: any = await createCustomer(email)
    if (!customer_id) {
      return NextResponse.json({ message, customerId: customer_id }, { status: 200 })
    }
    const { customerPortalUrl } = await api.customerSessions.create({
      customerId: customer_id,
    })

    return NextResponse.json({ customerPortalUrl, customerId: customer_id, message }, { status: 201 })
  } catch (error) {
    console.log('Error in customer portal.', error)
  }
}
