'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect } from 'react'

export function WalletButton() {
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet()
  const { setVisible } = useWalletModal()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="swarm-button-primary" disabled>
        Loading...
      </button>
    )
  }

  if (connecting) {
    return (
      <button className="swarm-button-primary" disabled>
        Connecting...
      </button>
    )
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-sm">
          <div className="font-medium">
            {wallet?.adapter.name}
          </div>
          <div className="text-gray-600 font-mono text-xs">
            {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
          </div>
        </div>
        <button
          onClick={disconnect}
          className="text-sm px-3 py-2 border border-black hover:bg-gray-50 transition-colors uppercase tracking-wider"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="swarm-button-primary"
    >
      Connect Wallet
    </button>
  )
}