import { NextResponse } from 'next/server'
import { supabaseReputationService } from '@/lib/supabase-reputation'

export async function GET() {
  try {
    const topUsers = await supabaseReputationService.getTopUsers()
    return NextResponse.json(topUsers)
  } catch (error) {
    console.error('Failed to get top users:', error)
    return NextResponse.json({ error: 'Failed to load top users' }, { status: 500 })
  }
}