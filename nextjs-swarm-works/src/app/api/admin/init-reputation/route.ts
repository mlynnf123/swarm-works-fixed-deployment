import { NextResponse } from 'next/server'
import { reputationService } from '@/lib/reputation'
import { backgroundJobService } from '@/lib/background-jobs'

export async function POST() {
  try {
    console.log('[INIT] Initializing reputation system...')
    
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
        const existingAgent = await reputationService.getAgent(agentType)
        if (existingAgent) {
          results.push({ agentType, status: 'exists', id: existingAgent.id })
        } else {
          const agent = await reputationService.initializeAgent(agentType)
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
    
    // Start background jobs
    backgroundJobService.start()
    
    return NextResponse.json({
      message: 'Reputation system initialized',
      agents: results,
      backgroundJobs: backgroundJobService.getStatus()
    })
    
  } catch (error) {
    console.error('Failed to initialize reputation system:', error)
    return NextResponse.json(
      { error: 'Failed to initialize reputation system' }, 
      { status: 500 }
    )
  }
}