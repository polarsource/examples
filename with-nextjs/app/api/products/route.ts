// app/api/products/route.ts

import { polar } from '@/app/polar'
import { NextResponse } from 'next/server'

// This is a server-side-only function. It can safely access all your secrets.
export async function GET() {
    try {
        const products = await polar.products.list({ isArchived: false })
        return NextResponse.json(products?.result?.items ?? [])
    } catch (error) {
        // If something goes wrong on the server, we'll see it in the Vercel logs.
        console.error('API Error: Failed to fetch Polar products:', error)
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 },
        )
    }
}
