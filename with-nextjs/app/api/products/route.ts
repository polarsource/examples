import { NextResponse } from 'next/server'
import { getPolar } from '@/app/polar'
import { Polar } from '@polar-sh/sdk'

export async function GET() {
  try {
    const polar: Polar | null = await getPolar()
    if (!polar) {
      throw new Error('Unable to get Polar Instance')
    }
    const products = await polar.products.list({})
    return NextResponse.json(products.result.items ?? [], { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to fetch products' }, { status: 500 })
  }
}
