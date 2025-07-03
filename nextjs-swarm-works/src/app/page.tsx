'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function HomePage() {
  // Animated counters for network stats
  const [stats, setStats] = useState({
    developers: 0,
    tokens: 0,
    swarms: 0,
    contributions: 0
  })

  const targetStats = {
    developers: 1847,
    tokens: 125000,
    swarms: 342,
    contributions: 15623
  }

  useEffect(() => {
    const animateCounter = (key: keyof typeof stats, target: number) => {
      let current = 0
      const increment = target / 100
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }))
      }, 20)
    }

    // Animate all counters
    Object.entries(targetStats).forEach(([key, value]) => {
      animateCounter(key as keyof typeof stats, value)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="swarm-hero-title mb-4">
              <span className="block">SWARM</span>
              <span className="block">WORKS</span>
            </h1>
            <div className="w-16 h-0.5 bg-black mx-auto mb-8"></div>
            <h2 className="text-2xl font-light tracking-wider text-gray-600 mb-4">
              DECENTRALIZED DEVELOPER COLLABORATION
            </h2>
            <p className="text-lg text-gray-700">
              Code Together. Earn Together.
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-3xl font-light mb-4 text-gray-400">01</div>
              <h3 className="text-xl font-light tracking-wider uppercase mb-4">Connect</h3>
              <p className="text-gray-600 mb-6">
                Link your Solana wallet to the decentralized ecosystem
              </p>
              <Link href="/wallet" className="swarm-button-secondary">
                Connect Wallet
              </Link>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-light mb-4 text-gray-400">02</div>
              <h3 className="text-xl font-light tracking-wider uppercase mb-4">Collaborate</h3>
              <p className="text-gray-600 mb-6">
                Join elite developer swarms across the globe
              </p>
              <Link href="/marketplace" className="swarm-button-secondary">
                Browse Projects
              </Link>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-light mb-4 text-gray-400">03</div>
              <h3 className="text-xl font-light tracking-wider uppercase mb-4">Elevate</h3>
              <p className="text-gray-600 mb-6">
                Build reputation through verified contributions
              </p>
              <Link href="/dashboard" className="swarm-button-secondary">
                View Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="swarm-section-title text-center mb-12">Capabilities</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-light tracking-wider uppercase mb-2">AI Assistance</h3>
              <p className="text-gray-600 text-sm">Four specialized agents</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-light tracking-wider uppercase mb-2">Real-Time</h3>
              <p className="text-gray-600 text-sm">Live collaboration</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-light tracking-wider uppercase mb-2">Blockchain</h3>
              <p className="text-gray-600 text-sm">Solana integration</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-light tracking-wider uppercase mb-2">GitHub</h3>
              <p className="text-gray-600 text-sm">Automated workflows</p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Status Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="swarm-section-title text-center mb-12">Network Status</h2>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-light mb-2">{stats.developers.toLocaleString()}</div>
              <div className="text-gray-600 uppercase tracking-wider text-sm">Developers</div>
            </div>
            <div>
              <div className="text-4xl font-light mb-2">{stats.tokens.toLocaleString()}</div>
              <div className="text-gray-600 uppercase tracking-wider text-sm">Tokens</div>
            </div>
            <div>
              <div className="text-4xl font-light mb-2">{stats.swarms.toLocaleString()}</div>
              <div className="text-gray-600 uppercase tracking-wider text-sm">Swarms</div>
            </div>
            <div>
              <div className="text-4xl font-light mb-2">{stats.contributions.toLocaleString()}</div>
              <div className="text-gray-600 uppercase tracking-wider text-sm">Contributions</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="swarm-section-title mb-6">Begin</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Join the elite network of developers<br />
            building the future of collaboration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace" className="swarm-button-primary">
              Browse Projects
            </Link>
            <Link href="/post-project" className="swarm-button-secondary">
              Post Project
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-light tracking-wider uppercase mb-4">Swarm Works</h3>
              <p className="text-gray-600 mb-4">Decentralized Developer Collaboration</p>
              <div className="flex space-x-6 text-sm">
                <Link href="/about" className="text-gray-600 hover:text-black uppercase tracking-wider">About</Link>
                <Link href="/docs" className="text-gray-600 hover:text-black uppercase tracking-wider">Documentation</Link>
                <Link href="/github" className="text-gray-600 hover:text-black uppercase tracking-wider">GitHub</Link>
                <Link href="/discord" className="text-gray-600 hover:text-black uppercase tracking-wider">Discord</Link>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 uppercase tracking-wider">
              © 2024 SWARM VIBE NETWORK. CRAFTED WITH PRECISION.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}