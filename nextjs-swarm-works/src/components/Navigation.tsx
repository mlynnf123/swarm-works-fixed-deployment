'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { WalletButton } from './WalletButton'

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    { name: 'Swarms', href: '/swarms' },
    { name: 'AI', href: '/ai' },
    { name: 'Wallet', href: '/wallet' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-xl font-light tracking-wider uppercase hover:opacity-80 transition-opacity"
          >
            Swarm Works
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm uppercase tracking-wider transition-colors hover:opacity-80 ${
                  pathname === item.href 
                    ? 'text-black font-medium' 
                    : 'text-gray-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={session.user?.image || '/default-avatar.png'}
                    alt={session.user?.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-normal">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {session.user?.role || 'DEVELOPER'}
                    </p>
                  </div>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-black shadow-lg z-50">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 uppercase tracking-wider"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 uppercase tracking-wider"
                      >
                        Settings
                      </Link>
                      <Link
                        href="/wallet"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 uppercase tracking-wider"
                      >
                        Wallet
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 uppercase tracking-wider"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <WalletButton />
                <Link
                  href="/login"
                  className="text-sm uppercase tracking-wider text-gray-600 hover:text-black transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}