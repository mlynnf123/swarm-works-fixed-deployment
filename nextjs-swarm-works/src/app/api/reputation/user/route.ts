import { NextResponse } from 'next/server'
import { reputationService } from '@/lib/reputation'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    // In a real app, get the user ID from the session
    // const session = await getServerSession()
    // const userId = session?.user?.id
    
    // For demo purposes, use a placeholder
    const userId = 'placeholder-user-id'
    
    const userReputation = await reputationService.getUserReputation(userId)
    
    if (!userReputation) {
      // Return default reputation for new users
      return NextResponse.json({
        totalReputation: 0,
        recentEvents: [],
        breakdown: {}
      })
    }
    
    return NextResponse.json(userReputation)
  } catch (error) {
    console.error('Failed to get user reputation:', error)
    return NextResponse.json({ error: 'Failed to load user reputation' }, { status: 500 })
  }
}