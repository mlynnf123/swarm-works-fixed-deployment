import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { generateReference } from '@/lib/solana'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, proposalId, amount, paymentMethod, description } = await request.json()

    // Validate required fields
    if (!projectId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, amount' },
        { status: 400 }
      )
    }

    // Verify project exists and user has permission
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.clientId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate payment reference
    const reference = generateReference()

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        projectId,
        proposalId,
        payerId: user.id,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'USDC',
        status: 'PENDING',
        reference: reference.toString(),
        description: description || `Payment for project: ${project.title}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    })

    return NextResponse.json({
      paymentId: payment.id,
      reference: reference.toString(),
      amount,
      paymentMethod: payment.paymentMethod,
      expiresAt: payment.expiresAt
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}