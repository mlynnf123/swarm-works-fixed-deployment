'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function WalletPage() {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const walletOptions = [
    {
      id: 'phantom',
      name: 'Phantom',
      description: 'A friendly crypto wallet built for Solana',
      icon: 'PH',
      popular: true
    },
    {
      id: 'solflare',
      name: 'Solflare',
      description: 'Secure and powerful Solana wallet',
      icon: 'SF',
      popular: true
    },
    {
      id: 'backpack',
      name: 'Backpack',
      description: 'The home for everything Solana',
      icon: 'BP',
      popular: false
    },
    {
      id: 'sollet',
      name: 'Sollet',
      description: 'Browser extension wallet for Solana',
      icon: 'SL',
      popular: false
    }
  ]

  const mockWalletData = {
    address: 'HN7cABqLq46Es1jh92dQQi...',
    balance: {
      sol: 12.45,
      swarm: 1250,
      usd: 2847.50
    },
    recentTransactions: [
      {
        id: '1',
        type: 'received',
        amount: 75,
        token: 'SWARM',
        from: 'React Optimization Project',
        timestamp: '2 hours ago',
        status: 'completed'
      },
      {
        id: '2',
        type: 'sent',
        amount: 0.5,
        token: 'SOL',
        to: 'Platform Fee',
        timestamp: '1 day ago',
        status: 'completed'
      },
      {
        id: '3',
        type: 'received',
        amount: 150,
        token: 'SWARM',
        from: 'TypeScript Migration',
        timestamp: '3 days ago',
        status: 'completed'
      }
    ]
  }

  const connectWallet = (walletId: string) => {
    setSelectedWallet(walletId)
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true)
    }, 1500)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-4xl mx-auto px-6 py-16">
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
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-section-title mb-2">
              WALLET
              <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
            </h1>
            <p className="text-gray-600 mt-4 mb-8">
              Manage your SWARM tokens and blockchain assets
            </p>
            <div className="bg-gray-50 border border-gray-200 p-8 max-w-md mx-auto">
              <h3 className="font-normal mb-4">Authentication Required</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Sign in to connect your wallet and manage your SWARM tokens.
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

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-section-title mb-2">
              WALLET
              <span className="block w-16 h-0.5 bg-black mt-4 mx-auto"></span>
            </h1>
            <p className="text-gray-600 mt-4 text-body">
              Manage your SWARM tokens and blockchain assets
            </p>
          </div>

          {/* Connect Wallet Section */}
          <div className="text-center mb-16">
            <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">WALLET</span>
            </div>
            <h2 className="text-2xl font-light tracking-wider uppercase mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 font-light mb-8 max-w-md mx-auto">
              Connect your Solana wallet to access SWARM tokens,
              track your reputation, and participate in the network
            </p>
          </div>

          {/* Wallet Options */}
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => connectWallet(wallet.id)}
                disabled={selectedWallet === wallet.id}
                className={`relative p-6 border text-left transition-all ${
                  selectedWallet === wallet.id
                    ? 'border-black bg-gray-50 cursor-wait'
                    : 'border-gray-300 hover:border-black hover:shadow-md'
                }`}
              >
                {wallet.popular && (
                  <span className="absolute top-3 right-3 text-xs uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-1">
                    Popular
                  </span>
                )}
                <div className="flex items-center mb-3">
                  <span className="text-lg font-bold mr-3 bg-gray-200 px-2 py-1 rounded">{wallet.icon}</span>
                  <h3 className="font-normal text-lg">{wallet.name}</h3>
                </div>
                <p className="text-gray-600 font-light text-sm">{wallet.description}</p>
                {selectedWallet === wallet.id && (
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Connecting...
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Security Note */}
          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="font-normal mb-3 flex items-center">
              <span className="mr-2 text-lg font-bold">SEC</span>
              Security & Privacy
            </h3>
            <ul className="text-sm text-gray-600 font-light space-y-2">
              <li>• Your wallet remains in your control at all times</li>
              <li>• We never store your private keys or seed phrases</li>
              <li>• All transactions are secured by the Solana blockchain</li>
              <li>• You can disconnect your wallet at any time</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-section-title mb-2">
              WALLET
              <span className="block w-16 h-0.5 bg-black mt-4"></span>
            </h1>
            <p className="text-gray-600 mt-4 text-body">
              Manage your SWARM tokens and blockchain assets
            </p>
          </div>
          <button 
            onClick={() => setIsConnected(false)}
            className="swarm-button-secondary"
          >
            DISCONNECT
          </button>
        </div>

        {/* Wallet Address */}
        <div className="swarm-card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-normal mb-2">Wallet Address</h3>
              <p className="text-gray-600 font-mono text-sm">{mockWalletData.address}</p>
            </div>
            <div className="flex gap-3">
              <button className="swarm-button-secondary text-sm py-2 px-4">
                COPY
              </button>
              <button className="swarm-button-secondary text-sm py-2 px-4">
                VIEW ON EXPLORER
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Balance Cards */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="swarm-card p-6 text-center">
                <div className="text-3xl font-light mb-2">{mockWalletData.balance.sol}</div>
                <div className="text-sm uppercase tracking-wider text-gray-600 font-light">SOL</div>
              </div>
              <div className="swarm-card p-6 text-center">
                <div className="text-3xl font-light mb-2">{mockWalletData.balance.swarm.toLocaleString()}</div>
                <div className="text-sm uppercase tracking-wider text-gray-600 font-light">SWARM Tokens</div>
              </div>
              <div className="swarm-card p-6 text-center">
                <div className="text-3xl font-light mb-2">${mockWalletData.balance.usd.toLocaleString()}</div>
                <div className="text-sm uppercase tracking-wider text-gray-600 font-light">USD Value</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="swarm-card p-6">
              <h3 className="font-normal text-lg mb-6 tracking-wider uppercase">Recent Transactions</h3>
              <div className="space-y-4">
                {mockWalletData.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-4 ${
                        tx.type === 'received' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-normal">
                          {tx.type === 'received' ? '+' : '-'}{tx.amount} {tx.token}
                        </p>
                        <p className="text-sm text-gray-600 font-light">
                          {tx.type === 'received' ? `From: ${tx.from}` : `To: ${tx.to}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-light">{tx.timestamp}</p>
                      <span className="text-xs uppercase tracking-wider bg-green-100 text-green-800 px-2 py-1">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="swarm-card p-6">
              <h3 className="font-normal text-lg mb-6 tracking-wider uppercase">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full swarm-button-primary">
                  SEND TOKENS
                </button>
                <button className="w-full swarm-button-secondary">
                  RECEIVE TOKENS
                </button>
                <button className="w-full swarm-button-secondary">
                  SWAP TOKENS
                </button>
                <button className="w-full swarm-button-secondary">
                  STAKE TOKENS
                </button>
              </div>
            </div>

            <div className="swarm-card p-6">
              <h3 className="font-normal text-lg mb-4 tracking-wider uppercase">Earnings</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">This Week</span>
                  <span className="font-normal">+225 SWARM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">This Month</span>
                  <span className="font-normal">+1,847 SWARM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-light">All Time</span>
                  <span className="font-normal">+12,456 SWARM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}