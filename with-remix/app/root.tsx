
import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'

import type { Route } from './+types/root'
import './app.css'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Header ported from Nuxt layout */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <NavLink to="/" className="text-2xl font-bold text-blue-700 dark:text-blue-500">
                Polar with Remix
              </NavLink>
              <div className="flex items-center gap-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `p-3 rounded-md transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                    }`
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/polar/customer-portal"
                  className={({ isActive }) =>
                    `p-3 rounded-md transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                    }`
                  }
                >
                  Customer Portal
                </NavLink>
              </div>
            </nav>
          </div>
        </header>

        {/* Main content area */}
        <main className="min-h-screen">{children}</main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto text-center">
      <h1 className="text-4xl font-bold text-red-500">{message}</h1>
      <p className="text-xl mt-4">{details}</p>
      {stack && (
        <pre className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-x-auto text-left">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
