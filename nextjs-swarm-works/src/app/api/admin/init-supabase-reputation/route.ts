import { NextResponse } from 'next/server'
import { supabaseReputationService } from '@/lib/supabase-reputation'

export async function POST() {
  try {
    console.log('[INIT] Initializing Supabase reputation system...')
    
    // Test Supabase connection
    const tablesReady = await supabaseReputationService.initializeTables()
    if (!tablesReady) {
      return NextResponse.json(
        { error: 'Supabase tables not accessible' },
        { status: 500 }
      )
    }

    // Initialize all AI agents
    const agentTypes = [
      'code-review',
      'documentation', 
      'test-generation',
      'performance',
      'security',
      'llm-judge'
    ]
    
    const results = []
    
    for (const agentType of agentTypes) {
      try {
        // Check if agent exists first
        const existingAgent = await supabaseReputationService.getAgent(agentType)
        if (existingAgent) {
          results.push({ agentType, status: 'exists', id: existingAgent.id })
        } else {
          const agent = await supabaseReputationService.initializeAgent(agentType)
          results.push({ agentType, status: 'created', id: agent.id })
        }
      } catch (error) {
        console.error(`Error with agent ${agentType}:`, error)
        results.push({ 
          agentType, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      message: 'Supabase reputation system initialized',
      agents: results,
      supabaseConnected: true
    })
    
  } catch (error) {
    console.error('Failed to initialize Supabase reputation system:', error)
    return NextResponse.json(
      { error: 'Failed to initialize Supabase reputation system' }, 
      { status: 500 }
    )
  }
}