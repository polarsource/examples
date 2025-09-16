'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ConfirmationPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => router.replace('/'), 3000)
  }, [])
  return (
    <div className="p-6 w-[40%] m-auto">
      <h1 className="text-2xl font-bold">Thank you for your purchase 🎉</h1>
    </div>
  )
}
