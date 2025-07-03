'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-section-title mb-4">
            UNAUTHORIZED
            <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
          </h1>
          <p className="text-gray-600 text-body">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full swarm-button-primary"
          >
            GO BACK
          </button>
          
          <Link
            href="/dashboard"
            className="block w-full py-3 px-6 border border-black hover:bg-gray-50 transition-colors text-center uppercase tracking-wider text-sm"
          >
            DASHBOARD
          </Link>
        </div>
      </div>
    </div>
  )
}