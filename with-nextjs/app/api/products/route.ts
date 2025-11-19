import { polar } from '@/lib/polar'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await polar.products.list({})
    return NextResponse.json(products.result.items ?? [], { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
}
