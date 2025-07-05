// Supabase-based Reputation System
// Alternative to Prisma that uses Supabase JavaScript client

import { supabase, AIAgent, ReputationEvent } from './supabase-client'

// Reputation point values (same as original)
export const REPUTATION_POINTS = {
  PROJECT_COMPLETED: 15,
  POSITIVE_REVIEW: 10,
  NEGATIVE_REVIEW: -8,
  AI_USAGE: 1,
  HELPFUL_FEEDBACK: 5,
  SUCCESSFUL_ANALYSIS: 10,
  PEER_VALIDATION_CORRECT: 7,
  PEER_VALIDATION_INCORRECT: -3,
  HIGH_CONFIDENCE_RESULT: 5,
  LOW_CONFIDENCE_RESULT: -2,
  CRITICAL_ISSUE_FOUND: 10,
  FALSE_POSITIVE: -5,
} as const

export type ReputationEventType = keyof typeof REPUTATION_POINTS

export class SupabaseReputationService {
  
  // Initialize database tables (create them if they don't exist)
  async initializeTables() {
    try {
      // Check if ai_agents table exists
      const { data: agents } = await supabase
        .from('ai_agents')
        .select('id')
        .limit(1)
      
      console.log('[SUPABASE] Tables appear to be accessible')
      return true
    } catch (error) {
      console.error('[SUPABASE] Error accessing tables:', error)
      return false
    }
  }

  // Initialize AI agents with default data
  async initializeAgent(agentType: string): Promise<AIAgent> {
    const agentConfig = {
      'code-review': { name: 'Code Review Agent', description: 'Analyzes code quality and best practices' },
      'documentation': { name: 'Documentation Agent', description: 'Generates comprehensive documentation' },
      'test-generation': { name: 'Test Generation Agent', description: 'Creates comprehensive test cases' },
      'performance': { name: 'Performance Agent', description: 'Analyzes performance bottlenecks' },
      'security': { name: 'Security Agent', description: 'Identifies security vulnerabilities' },
      'llm-judge': { name: 'LLM Judge Agent', description: 'Provides overall code assessment' },
    }

    const config = agentConfig[agentType as keyof typeof agentConfig] || {
      name: `${agentType} Agent`,
      description: `AI agent for ${agentType} tasks`
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .insert({
        agenttype: agentType,
        name: config.name,
        description: config.description,
        reputation: 100, // Starting reputation
        totalvalidations: 0,
        successfulvalidations: 0,
        averageconfidence: 0.0,
        isactive: true,
        lastactiveat: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create agent: ${error.message}`)
    }

    console.log(`[AGENT] Created ${agentType}: ${config.name}`)
    return data
  }

  // Get agent by type
  async getAgent(agentType: string): Promise<AIAgent | null> {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('agenttype', agentType)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        return null
      }
      throw new Error(`Failed to get agent: ${error.message}`)
    }

    return data
  }

  // Get agent leaderboard
  async getAgentLeaderboard(): Promise<AIAgent[]> {
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('isactive', true)
      .order('reputation', { ascending: false })

    if (error) {
      throw new Error(`Failed to get agent leaderboard: ${error.message}`)
    }

    return data || []
  }

  // Award reputation to an agent
  async awardAgentReputation(
    agentType: string,
    eventType: ReputationEventType,
    reason: string,
    metadata?: any
  ) {
    const points = REPUTATION_POINTS[eventType]
    
    // Get or create agent
    let agent = await this.getAgent(agentType)
    if (!agent) {
      agent = await this.initializeAgent(agentType)
    }

    // Create reputation event
    const { error: eventError } = await supabase
      .from('reputation_events')
      .insert({
        agentId: agent.id,
        eventType,
        points,
        reason,
        metadata: metadata || {}
      })

    if (eventError) {
      throw new Error(`Failed to create reputation event: ${eventError.message}`)
    }

    // Update agent reputation
    const { error: updateError } = await supabase
      .from('ai_agents')
      .update({
        reputation: agent.reputation + points,
        lastActiveAt: new Date().toISOString()
      })
      .eq('id', agent.id)

    if (updateError) {
      throw new Error(`Failed to update agent reputation: ${updateError.message}`)
    }

    console.log(`[AGENT] ${agentType}: ${points > 0 ? '+' : ''}${points} points for ${eventType}`)
    return points
  }

  // Get user reputation (placeholder for when user system is integrated)
  async getUserReputation(userId: string = 'demo-user') {
    // For now, return mock data since user system might not be fully integrated
    return {
      totalReputation: 2847,
      recentEvents: [
        { eventType: 'PROJECT_COMPLETED', points: 15, reason: 'Completed React optimization project', createdAt: new Date().toISOString() },
        { eventType: 'POSITIVE_REVIEW', points: 10, reason: 'Received excellent client feedback', createdAt: new Date().toISOString() },
        { eventType: 'AI_USAGE', points: 1, reason: 'Used AI for code review', createdAt: new Date().toISOString() }
      ],
      breakdown: {
        'PROJECT_COMPLETED': 450,
        'POSITIVE_REVIEW': 380,
        'AI_USAGE': 127,
        'HELPFUL_FEEDBACK': 95
      }
    }
  }

  // Get top users (placeholder)
  async getTopUsers() {
    // Return mock data for now
    return [
      { id: '1', name: 'Alex Johnson', username: 'alexj', reputation: 3245, role: 'Full Stack Developer' },
      { id: '2', name: 'Sarah Chen', username: 'sarahc', reputation: 2987, role: 'Frontend Specialist' },
      { id: '3', name: 'Mike Rodriguez', username: 'miker', reputation: 2654, role: 'Backend Engineer' }
    ]
  }
}

export const supabaseReputationService = new SupabaseReputationService()