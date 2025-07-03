'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('github', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        console.error('Sign in error:', result.error)
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const networkStats = [
    { number: '1,847', label: 'Developers' },
    { number: '342', label: 'Active Swarms' },
    { number: '15,623', label: 'Contributions' }
  ]

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Form */}
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="mb-8">
              <h1 className="text-section-title mb-2">
                SIGN IN
                <span className="block w-16 h-0.5 bg-black mt-4"></span>
              </h1>
              <p className="text-gray-600 mt-4 text-body">
                Access your developer dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* GitHub Sign In */}
              <button
                type="button"
                onClick={handleGithubSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 border border-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="font-light tracking-wider uppercase">
                  Continue with GitHub
                </span>
              </button>

              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-500 font-light uppercase tracking-wider">
                  Or continue with email
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm uppercase tracking-wider mb-3 font-normal">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-black bg-white focus:outline-none font-light"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full swarm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'PLEASE WAIT...' : 'SIGN IN'}
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-gray-600 hover:text-black transition-colors font-light uppercase tracking-wider"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Toggle Sign Up/Sign In */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 font-light">
                  Don't have an account?
                </p>
                <Link
                  href="/register"
                  className="text-sm font-normal hover:underline uppercase tracking-wider mt-1 inline-block"
                >
                  CREATE ACCOUNT
                </Link>
              </div>
            </form>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-light tracking-wider uppercase mb-8">Elite Network</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Collaborate</h3>
                    <p className="text-gray-600 font-light">
                      Join exclusive coding swarms with top developers worldwide
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Earn</h3>
                    <p className="text-gray-600 font-light">
                      Build reputation and earn SWARM tokens for your contributions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Grow</h3>
                    <p className="text-gray-600 font-light">
                      Access AI assistance and learn from industry experts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              {networkStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-light mb-1">{stat.number}</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600 font-light">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}