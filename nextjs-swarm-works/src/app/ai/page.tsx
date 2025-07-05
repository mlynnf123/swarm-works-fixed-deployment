'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { AgentOrchestrator } from '@/components/ai/AgentOrchestrator'

export default function AIPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-section-title mb-2">
              AI AGENT ANALYSIS
              <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
            </h1>
            <p className="text-gray-600 mt-4 text-body mb-8">
              Access your personalized AI agents for code review, testing, and project analysis
            </p>
            <div className="bg-gray-50 border border-gray-200 p-8 max-w-md mx-auto">
              <h3 className="font-normal mb-4">Authentication Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Sign in to access AI agents and analyze your code with advanced intelligence.
              </p>
              <Link href="/login" className="swarm-button-primary">
                SIGN IN TO CONTINUE
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-section-title mb-2">
            AI AGENT ANALYSIS
            <span className="block w-16 h-0.5 bg-black mt-4"></span>
          </h1>
          <p className="text-gray-600 mt-4 text-body">
            Analyze your code with 5 specialized AI agents: Code Review, Documentation, 
            Test Generation, Performance, and Security Analysis
          </p>
        </div>

        <AgentOrchestrator />
      </div>
    </div>
  )
}