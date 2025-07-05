import { NextResponse } from 'next/server'
import { supabaseReputationService } from '@/lib/supabase-reputation'

export async function GET() {
  try {
    const agents = await supabaseReputationService.getAgentLeaderboard()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Failed to get agent leaderboard:', error)
    return NextResponse.json({ error: 'Failed to load agent data' }, { status: 500 })
  }
}