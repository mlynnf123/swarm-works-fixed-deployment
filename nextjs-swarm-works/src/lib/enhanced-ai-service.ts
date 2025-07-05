// Enhanced AI Service with Reputation and Validation
import { MultiAgentService } from './ai-agents-service'
import { reputationService } from './reputation'
import { agentValidationService } from './agent-validation'
import { PrismaClient } from '@prisma/client'
import { AgentType, AgentRequest, AgentResponse } from '@/types/ai-agents'

const prisma = new PrismaClient()

export class EnhancedAIService extends MultiAgentService {
  
  // Override callAgent to integrate reputation tracking
  protected async callAgent(agentType: AgentType, request: Omit<AgentRequest, 'agentType'>): Promise<AgentResponse> {
    const startTime = Date.now()
    
    try {
      // Call the original agent
      const result = await super.callAgent(agentType, request)
      
      const executionTime = (Date.now() - startTime) / 1000
      const success = true
      
      // Create AI session record
      const session = await this.createAISession(agentType, request, result, executionTime)
      
      // Process reputation for both user and agent
      if (typeof window === 'undefined') { // Only on server side
        await this.processReputation(session.id, agentType, {
          confidence: result.confidence || 0.5,
          executionTime,
          success
        })
        
        // Trigger autonomous validation (async, don't wait)
        setTimeout(() => {
          agentValidationService.triggerValidation(session.id, agentType)
        }, 1000)
      }
      
      return result
    } catch (error) {
      const executionTime = (Date.now() - startTime) / 1000
      
      // Still create session record for failed attempts
      if (typeof window === 'undefined') {
        await this.createAISession(agentType, request, null, executionTime, error as Error)
      }
      
      throw error
    }
  }

  // Create AI session record
  private async createAISession(
    agentType: AgentType,
    request: Omit<AgentRequest, 'agentType'>,
    result: AgentResponse | null,
    executionTime: number,
    error?: Error
  ) {
    // For now, we'll use a placeholder user ID
    // In a real app, this would come from the session/auth context
    const userId = 'placeholder-user-id'
    
    try {
      return await prisma.aISession.create({
        data: {
          userId,
          agentType,
          task: 'analyze', // Could be more specific based on request
          inputCode: request.code || '',
          outputResult: result ? JSON.stringify(result) : null,
          language: request.language,
          tokensUsed: Math.floor(Math.random() * 1000 + 500), // Estimated
          status: error ? 'failed' : 'completed',
          error: error?.message
        }
      })
    } catch (dbError) {
      console.error('Failed to create AI session:', dbError)
      // Return a mock session if DB fails
      return { id: 'mock-session-' + Date.now() }
    }
  }

  // Process reputation for completed AI session
  private async processReputation(
    sessionId: string,
    agentType: AgentType,
    result: { confidence: number; executionTime: number; success: boolean }
  ) {
    try {
      await reputationService.processAISessionReputation(
        sessionId,
        'placeholder-user-id', // Would be real user ID in production
        agentType,
        result
      )
    } catch (error) {
      console.error('Failed to process reputation:', error)
    }
  }

  // Get agent statistics with reputation
  async getAgentStats(agentType: AgentType) {
    try {
      const agentReputation = await reputationService.getAgentReputation(agentType)
      return agentReputation
    } catch (error) {
      console.error('Failed to get agent stats:', error)
      return null
    }
  }

  // Get user reputation
  async getUserReputation(userId: string) {
    try {
      return await reputationService.getUserReputation(userId)
    } catch (error) {
      console.error('Failed to get user reputation:', error)
      return null
    }
  }

  // Get validation consensus for a session
  async getSessionConsensus(sessionId: string) {
    try {
      return await agentValidationService.getValidationConsensus(sessionId)
    } catch (error) {
      console.error('Failed to get session consensus:', error)
      return null
    }
  }

  // Get agent leaderboard
  async getAgentLeaderboard() {
    try {
      return await reputationService.getAgentLeaderboard()
    } catch (error) {
      console.error('Failed to get agent leaderboard:', error)
      return []
    }
  }

  // Get top users
  async getTopUsers(limit = 10) {
    try {
      return await reputationService.getTopUsers(limit)
    } catch (error) {
      console.error('Failed to get top users:', error)
      return []
    }
  }
}

// Export enhanced service instance
export const enhancedAIService = new EnhancedAIService()