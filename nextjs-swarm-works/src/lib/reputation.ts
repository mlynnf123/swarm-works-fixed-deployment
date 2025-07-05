// Reputation System for Swarm Works
// Based on the original Manus AI Swarm concept

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Reputation point values (from original Manus AI Swarm)
export const REPUTATION_POINTS = {
  // User actions
  PROJECT_COMPLETED: 15,
  POSITIVE_REVIEW: 10,
  NEGATIVE_REVIEW: -8,
  AI_USAGE: 1,
  HELPFUL_FEEDBACK: 5,
  
  // Agent actions
  SUCCESSFUL_ANALYSIS: 10,
  PEER_VALIDATION_CORRECT: 7,
  PEER_VALIDATION_INCORRECT: -3,
  HIGH_CONFIDENCE_RESULT: 5,
  LOW_CONFIDENCE_RESULT: -2,
  CRITICAL_ISSUE_FOUND: 10,
  FALSE_POSITIVE: -5,
} as const

export type ReputationEventType = keyof typeof REPUTATION_POINTS

export class ReputationService {
  
  // Award reputation to a user
  async awardUserReputation(
    userId: string, 
    eventType: ReputationEventType, 
    reason: string, 
    metadata?: any
  ) {
    const points = REPUTATION_POINTS[eventType]
    
    // Create reputation event
    await prisma.reputationEvent.create({
      data: {
        userId,
        eventType,
        points,
        reason,
        metadata: metadata || {},
      }
    })
    
    // Update user's total reputation
    await prisma.user.update({
      where: { id: userId },
      data: {
        reputation: {
          increment: points
        }
      }
    })
    
    console.log(`👤 User ${userId}: ${points > 0 ? '+' : ''}${points} points for ${eventType}`)
    return points
  }

  // Award reputation to an AI agent
  async awardAgentReputation(
    agentType: string, 
    eventType: ReputationEventType, 
    reason: string, 
    metadata?: any
  ) {
    const points = REPUTATION_POINTS[eventType]
    
    // Find or create agent
    let agent = await prisma.aIAgent.findUnique({
      where: { agentType }
    })
    
    if (!agent) {
      agent = await this.initializeAgent(agentType)
    }
    
    // Create reputation event
    await prisma.reputationEvent.create({
      data: {
        agentId: agent.id,
        eventType,
        points,
        reason,
        metadata: metadata || {},
      }
    })
    
    // Update agent's reputation
    await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        reputation: {
          increment: points
        },
        lastActiveAt: new Date(),
      }
    })
    
    console.log(`[AGENT] ${agentType}: ${points > 0 ? '+' : ''}${points} points for ${eventType}`)
    return points
  }

  // Get an AI agent by type
  async getAgent(agentType: string) {
    return await prisma.aIAgent.findUnique({
      where: { agentType }
    })
  }

  // Initialize a new AI agent with default reputation
  async initializeAgent(agentType: string) {
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
    
    return await prisma.aIAgent.create({
      data: {
        agentType,
        name: config.name,
        description: config.description,
        reputation: 100, // Starting reputation
      }
    })
  }

  // Get user reputation with breakdown
  async getUserReputation(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reputationEvents: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
    
    if (!user) return null
    
    // Calculate reputation breakdown
    const events = await prisma.reputationEvent.findMany({
      where: { userId },
      select: { eventType: true, points: true }
    })
    
    const breakdown = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + event.points
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalReputation: user.reputation,
      recentEvents: user.reputationEvents,
      breakdown
    }
  }

  // Get agent reputation and performance metrics
  async getAgentReputation(agentType: string) {
    const agent = await prisma.aIAgent.findUnique({
      where: { agentType },
      include: {
        reputationHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        validationsGiven: {
          select: { verdict: true, confidenceScore: true }
        }
      }
    })
    
    if (!agent) return null
    
    // Calculate success rate
    const validations = agent.validationsGiven
    const successfulValidations = validations.filter(v => 
      v.verdict === 'APPROVED' || v.verdict === 'EXCELLENT'
    ).length
    
    const successRate = validations.length > 0 
      ? (successfulValidations / validations.length) * 100 
      : 0
      
    // Calculate average confidence
    const avgConfidence = validations.length > 0
      ? validations.reduce((sum, v) => sum + v.confidenceScore, 0) / validations.length
      : 0
    
    return {
      ...agent,
      successRate,
      averageConfidence: avgConfidence,
      totalValidations: validations.length
    }
  }

  // Get top users by reputation
  async getTopUsers(limit = 10) {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        reputation: true,
        image: true,
        role: true
      },
      orderBy: { reputation: 'desc' },
      take: limit,
      where: {
        reputation: { gt: 0 }
      }
    })
  }

  // Get agent leaderboard
  async getAgentLeaderboard() {
    return await prisma.aIAgent.findMany({
      select: {
        agentType: true,
        name: true,
        reputation: true,
        totalValidations: true,
        successfulValidations: true,
        averageConfidence: true,
        isActive: true
      },
      orderBy: { reputation: 'desc' },
      where: { isActive: true }
    })
  }

  // Award reputation based on AI session results
  async processAISessionReputation(
    sessionId: string, 
    userId: string, 
    agentType: string,
    result: {
      confidence: number
      executionTime: number
      success: boolean
    }
  ) {
    // Award user reputation for using AI
    await this.awardUserReputation(userId, 'AI_USAGE', `Used ${agentType} agent`)
    
    // Award agent reputation based on performance
    if (result.success) {
      await this.awardAgentReputation(agentType, 'SUCCESSFUL_ANALYSIS', `Successful analysis in ${result.executionTime}s`)
      
      // Bonus for high confidence
      if (result.confidence > 0.8) {
        await this.awardAgentReputation(agentType, 'HIGH_CONFIDENCE_RESULT', `High confidence result: ${result.confidence}`)
      }
    } else {
      // Penalty for low confidence or failure
      if (result.confidence < 0.3) {
        await this.awardAgentReputation(agentType, 'LOW_CONFIDENCE_RESULT', `Low confidence result: ${result.confidence}`)
      }
    }
    
    // Update agent performance metrics
    await this.updateAgentMetrics(agentType, result)
  }

  // Update agent performance metrics
  private async updateAgentMetrics(
    agentType: string, 
    result: { confidence: number; executionTime: number; success: boolean }
  ) {
    const agent = await prisma.aIAgent.findUnique({ where: { agentType } })
    if (!agent) return
    
    const newTotalRequests = agent.totalRequests + 1
    const newAvgExecutionTime = (agent.averageExecutionTime * agent.totalRequests + result.executionTime) / newTotalRequests
    const newAvgConfidence = (agent.averageConfidence * agent.totalRequests + result.confidence) / newTotalRequests
    
    await prisma.aIAgent.update({
      where: { agentType },
      data: {
        totalRequests: newTotalRequests,
        averageExecutionTime: newAvgExecutionTime,
        averageConfidence: newAvgConfidence,
        lastActiveAt: new Date()
      }
    })
  }
}

// Export singleton instance
export const reputationService = new ReputationService()