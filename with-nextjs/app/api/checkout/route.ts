import { getPolar, successUrl } from '@/app/polar'
import { Polar } from '@polar-sh/sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ message: 'productId is required.' }, { status: 400 })
    }

    const polar: Polar | null = await getPolar()

    if (!polar) {
      throw new Error('Unable to get Polar Instance.')
    }

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: successUrl,
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
