import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { verifyTransaction } from '@/lib/solana'
import { PublicKey } from '@solana/web3.js'
import BigNumber from 'bignumber.js'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, signature } = await request.json()

    if (!paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, signature' },
        { status: 400 }
      )
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        project: true,
        proposal: true
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.payerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Payment already processed' },
        { status: 400 }
      )
    }

    // Check if payment has expired
    if (payment.expiresAt && new Date() > payment.expiresAt) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json(
        { error: 'Payment has expired' },
        { status: 400 }
      )
    }

    // Verify the transaction on Solana
    const isValid = await verifyTransaction(
      signature,
      new PublicKey(process.env.NEXT_PUBLIC_MERCHANT_WALLET!),
      new BigNumber(payment.amount),
      payment.reference ? new PublicKey(payment.reference) : undefined
    )

    if (!isValid) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED' }
      })
      return NextResponse.json(
        { error: 'Transaction verification failed' },
        { status: 400 }
      )
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CONFIRMED',
        transactionSignature: signature,
        confirmedAt: new Date()
      }
    })

    // If this is for a proposal, update proposal status
    if (payment.proposalId) {
      await prisma.proposal.update({
        where: { id: payment.proposalId },
        data: { status: 'ACCEPTED' }
      })

      // Update project status
      await prisma.project.update({
        where: { id: payment.projectId },
        data: { status: 'IN_PROGRESS' }
      })
    }

    // Update user spending
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalSpent: {
          increment: payment.amount
        }
      }
    })

    // If there's a developer involved, update their earnings
    if (payment.proposal?.developerId) {
      await prisma.user.update({
        where: { id: payment.proposal.developerId },
        data: {
          totalEarnings: {
            increment: payment.amount
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: 'Payment confirmed successfully'
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Missing paymentId parameter' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        project: true,
        proposal: {
          include: {
            developer: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.payerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(payment)

  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}