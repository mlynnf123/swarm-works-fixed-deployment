import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protected routes that require authentication
        const protectedPaths = ['/dashboard', '/profile', '/settings', '/post-project']
        const pathname = req.nextUrl.pathname

        // Allow access to auth pages when not authenticated
        if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
          return true
        }

        // Check if the current path is protected
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          return !!token
        }

        // Allow access to public pages
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}