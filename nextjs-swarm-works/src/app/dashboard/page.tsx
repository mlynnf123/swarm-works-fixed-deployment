'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { GitHubIntegration } from '@/components/GitHubIntegration'
import { ReputationDashboard } from '@/components/dashboard/ReputationDashboard'

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
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
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="swarm-section-title mb-2">
              DASHBOARD
              <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
            </h1>
            <p className="text-gray-600 mt-4 mb-8">
              Your development analytics and network status
            </p>
            <div className="bg-gray-50 border border-gray-200 p-8 max-w-md mx-auto">
              <h3 className="font-normal mb-4">Authentication Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Sign in to access your personal dashboard with reputation tracking and project analytics.
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
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="swarm-section-title mb-2">
            DASHBOARD
            <span className="block w-16 h-0.5 bg-black mt-4"></span>
          </h1>
          <p className="text-gray-600 mt-4">
            Your development analytics and network status
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 border border-gray-200">
                <div className="text-3xl font-light mb-2">2,847</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">Reputation Points</div>
              </div>
              <div className="text-center p-6 border border-gray-200">
                <div className="text-3xl font-light mb-2">1,250</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">SWARM Tokens</div>
              </div>
              <div className="text-center p-6 border border-gray-200">
                <div className="text-3xl font-light mb-2">23</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">Active Projects</div>
              </div>
              <div className="text-center p-6 border border-gray-200">
                <div className="text-3xl font-light mb-2">156</div>
                <div className="text-sm uppercase tracking-wider text-gray-600">Contributions</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="swarm-card p-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">Recent Activity</h2>
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Joined React Optimization Swarm</h3>
                    <span className="text-sm text-gray-500">2h ago</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Collaborated on performance improvements for e-commerce platform
                  </p>
                  <span className="text-sm font-medium text-green-600">+75 Tokens</span>
                </div>

                <div className="border-b border-gray-100 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Completed TypeScript Migration</h3>
                    <span className="text-sm text-gray-500">1d ago</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Successfully migrated legacy JavaScript codebase to TypeScript
                  </p>
                  <span className="text-sm font-medium text-green-600">+150 Tokens</span>
                </div>

                <div className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">AI Code Review Session</h3>
                    <span className="text-sm text-gray-500">3d ago</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Utilized AI assistance for comprehensive code review and optimization
                  </p>
                  <span className="text-sm font-medium text-green-600">+50 Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="lg:col-span-1">
            <div className="swarm-card p-6 mb-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">Current Status</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Reputation Level</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-light">Expert</span>
                    <span className="text-sm text-gray-600">57% to Master</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 mt-2">
                    <div className="bg-black h-2 w-3/5"></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Active Swarms</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>React Performance Optimization</span>
                      <span className="text-green-600 text-xs uppercase">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Blockchain Integration</span>
                      <span className="text-orange-600 text-xs uppercase">Pending</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Pending Rewards</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-light">+75</span>
                      <span className="text-sm text-gray-600 ml-2">SWARM Tokens</span>
                    </div>
                    <button className="swarm-button-primary text-xs py-2 px-4">
                      Claim Rewards
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="lg:col-span-3 mb-8">
            <div className="swarm-card p-6">
              <GitHubIntegration />
            </div>
          </div>

          {/* Reputation & Agent Network */}
          <div className="lg:col-span-3 mb-8">
            <div className="swarm-card p-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">AI Agent Network & Reputation</h2>
              <ReputationDashboard />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-3">
            <div className="swarm-card p-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">Quick Actions</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/marketplace" className="block p-6 border border-gray-300 hover:border-black transition-colors">
                  <div className="text-2xl font-light mb-2 text-gray-400">01</div>
                  <h3 className="font-medium mb-2">Browse Projects</h3>
                  <p className="text-gray-600 text-sm">Find and bid on coding projects</p>
                </Link>

                <Link href="/post-project" className="block p-6 border border-gray-300 hover:border-black transition-colors">
                  <div className="text-2xl font-light mb-2 text-gray-400">02</div>
                  <h3 className="font-medium mb-2">Post Project</h3>
                  <p className="text-gray-600 text-sm">Get help with your coding needs</p>
                </Link>

                <Link href="/ai" className="block p-6 border border-gray-300 hover:border-black transition-colors">
                  <div className="text-2xl font-light mb-2 text-gray-400">03</div>
                  <h3 className="font-medium mb-2">AI Assistant</h3>
                  <p className="text-gray-600 text-sm">Get intelligent coding assistance</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}