import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import { AuthProvider } from '@/components/AuthProvider'
import { WalletProvider } from '@/components/WalletProvider'

export const metadata: Metadata = {
  title: 'Swarm Works - Decentralized Developer Collaboration',
  description: 'Code Together. Earn Together.',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased">
        <AuthProvider>
          <WalletProvider>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          </WalletProvider>
        </AuthProvider>
        {/* Made with Manus attribution */}
        <div className="fixed bottom-4 right-4 z-50">
          <a 
            href="https://manus.im/app?from=space"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-full text-xs hover:bg-gray-800 transition-colors"
          >
            <span>Made with Manus</span>
          </a>
        </div>
      </body>
    </html>
  )
}