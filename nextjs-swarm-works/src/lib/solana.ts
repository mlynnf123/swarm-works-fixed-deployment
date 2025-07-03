import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js'
import { createQR, encodeURL, createTransfer, parseURL } from '@solana/pay'
import BigNumber from 'bignumber.js'

// Solana network configuration
export const SOLANA_NETWORK = process.env.NODE_ENV === 'production' ? 'mainnet-beta' : 'devnet'
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK)
)

// SWARM token configuration (placeholder - you'll need to deploy actual token)
export const SWARM_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_SWARM_TOKEN_MINT || 
  '11111111111111111111111111111112' // Placeholder, replace with actual SWARM token mint
)

// Merchant wallet (your marketplace's receiving wallet)
export const MERCHANT_WALLET = new PublicKey(
  process.env.NEXT_PUBLIC_MERCHANT_WALLET || 
  '11111111111111111111111111111112' // Replace with your actual wallet
)

// USDC token mint addresses
export const USDC_MINT = {
  'mainnet-beta': new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  'devnet': new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
}

export const getCurrentUSDCMint = () => USDC_MINT[SOLANA_NETWORK]

// Payment configuration
export interface PaymentRequest {
  recipient: PublicKey
  amount: BigNumber
  splToken?: PublicKey
  reference?: PublicKey
  label?: string
  message?: string
  memo?: string
}

// Create payment URL for Solana Pay
export function createPaymentURL(request: PaymentRequest): URL {
  return encodeURL({
    recipient: request.recipient,
    amount: request.amount,
    splToken: request.splToken,
    reference: request.reference,
    label: request.label,
    message: request.message,
    memo: request.memo
  })
}

// Create QR code for payment
export async function createPaymentQR(request: PaymentRequest): Promise<string> {
  const url = createPaymentURL(request)
  const qr = createQR(url, 400, 'transparent')
  return qr.toDataURL()
}

// Parse payment URL
export function parsePaymentURL(url: string | URL) {
  return parseURL(url)
}

// Convert USD to SOL (you'll need to implement price oracle)
export async function convertUSDToSOL(usdAmount: number): Promise<number> {
  try {
    // This is a placeholder - implement actual price oracle
    // You could use Jupiter API, CoinGecko, or other price feeds
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    const data = await response.json()
    const solPrice = data.solana.usd
    return usdAmount / solPrice
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    // Fallback price (update this regularly)
    return usdAmount / 100 // Assuming $100 per SOL as fallback
  }
}

// Convert USD to USDC (1:1 ratio)
export function convertUSDToUSDC(usdAmount: number): number {
  return usdAmount
}

// Generate reference key for payment tracking
export function generateReference(): PublicKey {
  return new PublicKey(
    Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
  )
}

// Utility functions
export const lamportsToSol = (lamports: number): number => lamports / LAMPORTS_PER_SOL
export const solToLamports = (sol: number): number => sol * LAMPORTS_PER_SOL

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// Transaction verification
export async function verifyTransaction(
  signature: string,
  recipient: PublicKey,
  amount: BigNumber,
  reference?: PublicKey
): Promise<boolean> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    })
    
    if (!transaction) {
      return false
    }

    // Verify transaction details
    // This is a simplified verification - you'd want more robust checks
    return transaction.meta?.err === null
  } catch (error) {
    console.error('Error verifying transaction:', error)
    return false
  }
}

// SWARM token utilities (for future implementation)
export class SWARMToken {
  static readonly decimals = 9
  static readonly symbol = 'SWARM'
  
  static toTokenAmount(amount: number): BigNumber {
    return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(this.decimals))
  }
  
  static fromTokenAmount(tokenAmount: BigNumber): number {
    return tokenAmount.dividedBy(new BigNumber(10).pow(this.decimals)).toNumber()
  }
}