import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export function Portal() {
  const [email, setEmail] = useState('')
  const router = useRouter()

  const redirect = () => {
    if (!email) return

    router.navigate({
      to: '/api/portal',
      search: { email },
      reloadDocument: true,
    })
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              ;(e.preventDefault(), redirect())
            }
          }}
        />

        <Button onClick={redirect} variant="outline">
          Continue
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/portal')({
  component: Portal,
})
