import { polar } from '@/lib/polar'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId } = body
    if (!productId) return NextResponse.json({ message: 'productId is required.' }, { status: 400 })
    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: process.env.POLAR_SUCCESS_URL,
    })
    return NextResponse.json(
      {
        checkout: checkout,
        message: 'Checkout successful.',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('❌ Error in checkout API:', error)
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 })
  }
}
