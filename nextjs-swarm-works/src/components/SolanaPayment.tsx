'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { createTransfer } from '@solana/pay'
import BigNumber from 'bignumber.js'
import {
  connection,
  createPaymentQR,
  createPaymentURL,
  generateReference,
  convertUSDToSOL,
  convertUSDToUSDC,
  getCurrentUSDCMint,
  MERCHANT_WALLET,
  PaymentStatus,
  verifyTransaction
} from '@/lib/solana'

interface SolanaPaymentProps {
  amount: number // USD amount
  projectId: string
  onPaymentComplete?: (signature: string) => void
  onPaymentError?: (error: string) => void
}

export function SolanaPayment({
  amount,
  projectId,
  onPaymentComplete,
  onPaymentError
}: SolanaPaymentProps) {
  const { publicKey, sendTransaction, connected } = useWallet()
  const [paymentMethod, setPaymentMethod] = useState<'SOL' | 'USDC'>('USDC')
  const [qrCode, setQrCode] = useState<string>('')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [reference, setReference] = useState<PublicKey | null>(null)
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.PENDING)
  const [isLoading, setIsLoading] = useState(false)
  const [solAmount, setSolAmount] = useState<number>(0)
  const [usdcAmount, setUsdcAmount] = useState<number>(0)

  useEffect(() => {
    const setupPayment = async () => {
      try {
        const ref = generateReference()
        setReference(ref)

        // Calculate amounts
        const solAmt = await convertUSDToSOL(amount)
        const usdcAmt = convertUSDToUSDC(amount)
        
        setSolAmount(solAmt)
        setUsdcAmount(usdcAmt)

        // Create payment request
        const paymentRequest = {
          recipient: MERCHANT_WALLET,
          amount: paymentMethod === 'SOL' 
            ? new BigNumber(solAmt)
            : new BigNumber(usdcAmt),
          splToken: paymentMethod === 'USDC' ? getCurrentUSDCMint() : undefined,
          reference: ref,
          label: 'Swarm Works',
          message: `Payment for project: ${projectId}`,
          memo: `swarm-payment-${projectId}-${Date.now()}`
        }

        // Generate QR code and URL
        const qr = await createPaymentQR(paymentRequest)
        const url = createPaymentURL(paymentRequest)
        
        setQrCode(qr)
        setPaymentUrl(url.toString())
      } catch (error) {
        console.error('Error setting up payment:', error)
        onPaymentError?.('Failed to setup payment')
      }
    }

    setupPayment()
  }, [amount, projectId, paymentMethod])

  const handleDirectPayment = async () => {
    if (!connected || !publicKey || !reference) {
      onPaymentError?.('Wallet not connected')
      return
    }

    setIsLoading(true)
    
    try {
      // Create transfer instruction
      const transferInstruction = await createTransfer(
        connection,
        publicKey,
        {
          recipient: MERCHANT_WALLET,
          amount: paymentMethod === 'SOL' 
            ? new BigNumber(solAmount)
            : new BigNumber(usdcAmount),
          splToken: paymentMethod === 'USDC' ? getCurrentUSDCMint() : undefined,
          reference,
          memo: `swarm-payment-${projectId}-${Date.now()}`
        }
      )

      // Create and send transaction
      const transaction = new Transaction().add(transferInstruction)
      const signature = await sendTransaction(transaction, connection)

      setStatus(PaymentStatus.CONFIRMED)
      onPaymentComplete?.(signature)
      
    } catch (error) {
      console.error('Payment error:', error)
      setStatus(PaymentStatus.FAILED)
      onPaymentError?.(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPaymentUrl = () => {
    navigator.clipboard.writeText(paymentUrl)
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-normal uppercase tracking-wider mb-4">
          Payment Method
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('USDC')}
            className={`p-4 border-2 transition-colors ${
              paymentMethod === 'USDC' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💵</div>
              <h4 className="font-medium uppercase tracking-wider">USDC</h4>
              <p className="text-sm text-gray-600 mt-1">
                ${usdcAmount.toFixed(2)} USDC
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Stable, 1:1 with USD
              </p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('SOL')}
            className={`p-4 border-2 transition-colors ${
              paymentMethod === 'SOL' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">◎</div>
              <h4 className="font-medium uppercase tracking-wider">SOL</h4>
              <p className="text-sm text-gray-600 mt-1">
                {solAmount.toFixed(4)} SOL
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Native Solana token
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="text-center">
          <h4 className="text-sm uppercase tracking-wider text-gray-600 mb-2">
            Total Amount
          </h4>
          <div className="text-3xl font-light mb-2">
            ${amount.toFixed(2)} USD
          </div>
          <div className="text-lg text-gray-600">
            = {paymentMethod === 'SOL' 
              ? `${solAmount.toFixed(4)} SOL` 
              : `${usdcAmount.toFixed(2)} USDC`
            }
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        {connected && publicKey ? (
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-3">
              Pay with Connected Wallet
            </h4>
            <button
              onClick={handleDirectPayment}
              disabled={isLoading || status === PaymentStatus.CONFIRMED}
              className="w-full swarm-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 
               status === PaymentStatus.CONFIRMED ? 'Payment Complete ✓' : 
               `Pay ${paymentMethod === 'SOL' ? `${solAmount.toFixed(4)} SOL` : `${usdcAmount.toFixed(2)} USDC`}`}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Connect your wallet to pay directly</p>
          </div>
        )}

        {/* QR Code Payment */}
        <div>
          <h4 className="text-sm uppercase tracking-wider mb-3">
            Pay with Mobile Wallet
          </h4>
          {qrCode && (
            <div className="text-center">
              <img 
                src={qrCode} 
                alt="Payment QR Code" 
                className="mx-auto mb-4 border rounded-lg"
                style={{ maxWidth: '200px' }}
              />
              <p className="text-sm text-gray-600 mb-3">
                Scan with Phantom, Solflare, or any Solana Pay compatible wallet
              </p>
              <button
                onClick={copyPaymentUrl}
                className="text-sm border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                Copy Payment Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status */}
      {status !== PaymentStatus.PENDING && (
        <div className={`p-4 rounded-lg ${
          status === PaymentStatus.CONFIRMED ? 'bg-green-50 border border-green-200' :
          status === PaymentStatus.FAILED ? 'bg-red-50 border border-red-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <p className={`text-sm ${
            status === PaymentStatus.CONFIRMED ? 'text-green-700' :
            status === PaymentStatus.FAILED ? 'text-red-700' :
            'text-yellow-700'
          }`}>
            {status === PaymentStatus.CONFIRMED ? '✓ Payment confirmed' :
             status === PaymentStatus.FAILED ? '✗ Payment failed' :
             '⏳ Payment pending'}
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Payments are processed on Solana {process.env.NODE_ENV === 'production' ? 'Mainnet' : 'Devnet'}</p>
        <p>• Transaction fees are typically under $0.01</p>
        <p>• Payments are confirmed within seconds</p>
      </div>
    </div>
  )
}