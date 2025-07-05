import { NextResponse } from 'next/server'
import { reputationService } from '@/lib/reputation'

export async function GET() {
  try {
    const topUsers = await reputationService.getTopUsers(10)
    return NextResponse.json(topUsers)
  } catch (error) {
    console.error('Failed to get top users:', error)
    return NextResponse.json({ error: 'Failed to load top users' }, { status: 500 })
  }
}