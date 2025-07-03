'use client'

import { RegistrationForm } from '@/components/RegistrationForm'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Registration Form */}
          <div>
            <RegistrationForm />
            
            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-light">
                Already have an account?
              </p>
              <Link
                href="/login"
                className="text-sm font-normal hover:underline uppercase tracking-wider mt-1 inline-block"
              >
                SIGN IN
              </Link>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-light tracking-wider uppercase mb-8">Why Join Swarm Works</h2>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Launch Your Career</h3>
                    <p className="text-gray-600 font-light">
                      Connect with top clients and build your professional portfolio with meaningful projects
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Smart Matching</h3>
                    <p className="text-gray-600 font-light">
                      AI-powered project matching based on your skills, experience, and preferences
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">Secure Payments</h3>
                    <p className="text-gray-600 font-light">
                      Blockchain-powered escrow system ensures safe and timely payments for all parties
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">AI Assistance</h3>
                    <p className="text-gray-600 font-light">
                      Get intelligent code reviews, suggestions, and assistance throughout your projects
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Stats */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-lg font-normal mb-6 uppercase tracking-wider">Growing Network</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-light mb-2">2,847</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600 font-light">
                    Active Developers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2">1,523</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600 font-light">
                    Projects Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2">$2.4M</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600 font-light">
                    Total Earnings
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light mb-2">98%</div>
                  <div className="text-sm uppercase tracking-wider text-gray-600 font-light">
                    Success Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}