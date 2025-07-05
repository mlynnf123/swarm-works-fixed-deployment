import { NextResponse } from 'next/server'
import { supabaseReputationService } from '@/lib/supabase-reputation'

export async function GET() {
  try {
    const userReputation = await supabaseReputationService.getUserReputation()
    return NextResponse.json(userReputation)
  } catch (error) {
    console.error('Failed to get user reputation:', error)
    return NextResponse.json({ error: 'Failed to load user reputation' }, { status: 500 })
  }
}