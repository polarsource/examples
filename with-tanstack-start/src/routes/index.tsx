import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">TanStack Start + Polar</h1>

      <div className="flex gap-4">
        <Button asChild>
          <Link to="/products">View Products</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link to="/portal">Customer Portal</Link>
        </Button>
      </div>
    </div>
  )
}
