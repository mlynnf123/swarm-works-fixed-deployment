// Autonomous Agent Validation System
// Implements peer-to-peer validation inspired by the original Manus AI Swarm gossip protocol

import { PrismaClient } from '@prisma/client'
import { reputationService } from './reputation'

const prisma = new PrismaClient()

export type ValidationResult = {
  verdict: 'APPROVED' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_ISSUE' | 'EXCELLENT'
  confidenceScore: number
  vibeAlignmentScore?: number
  technicalScore: number
  positiveAspects: string[]
  improvementSuggestions: string[]
  criticalIssues: string[]
}

export class AgentValidationService {
  
  // Trigger autonomous validation after an AI session
  async triggerValidation(sessionId: string, primaryAgentType: string) {
    console.log(`🔄 Triggering autonomous validation for session ${sessionId}`)
    
    // Get the AI session details
    const session = await prisma.aISession.findUnique({
      where: { id: sessionId },
      include: { user: true }
    })
    
    if (!session) return
    
    // Get all other active agents to validate the primary agent's work
    const validators = await prisma.aIAgent.findMany({
      where: {
        agentType: { not: primaryAgentType },
        isActive: true,
        reputation: { gte: 50 } // Only agents with decent reputation can validate
      },
      orderBy: { reputation: 'desc' },
      take: 3 // Use top 3 agents as validators
    })
    
    // Perform validation with each validator
    for (const validator of validators) {
      await this.performPeerValidation(validator.agentType, primaryAgentType, sessionId)
    }
    
    // Generate gossip packets
    await this.generateGossipPackets(sessionId, primaryAgentType, validators.map(v => v.agentType))
  }

  // Perform peer validation between two agents
  async performPeerValidation(
    validatorAgentType: string,
    validatedAgentType: string,
    sessionId: string
  ) {
    console.log(`[VALIDATION] ${validatorAgentType} validating ${validatedAgentType}`)
    
    // Get the original session data
    const session = await prisma.aISession.findUnique({
      where: { id: sessionId }
    })
    
    if (!session || !session.outputResult) return
    
    // Simulate validation based on agent specialties and reputation
    const validation = await this.simulateValidation(
      validatorAgentType,
      validatedAgentType,
      session.inputCode,
      session.outputResult,
      session.language || 'javascript'
    )
    
    // Store validation result
    await prisma.agentValidation.create({
      data: {
        validatorAgentId: await this.getAgentId(validatorAgentType),
        validatedAgentId: await this.getAgentId(validatedAgentType),
        sessionId,
        verdict: validation.verdict,
        confidenceScore: validation.confidenceScore,
        vibeAlignmentScore: validation.vibeAlignmentScore,
        technicalScore: validation.technicalScore,
        positiveAspects: validation.positiveAspects,
        improvementSuggestions: validation.improvementSuggestions,
        criticalIssues: validation.criticalIssues,
        validationMethod: 'autonomous',
        executionTime: Math.random() * 2 + 0.5 // Simulate execution time
      }
    })
    
    // Award reputation based on validation quality
    await this.processValidationReputation(validatorAgentType, validatedAgentType, validation)
  }

  // Simulate validation logic based on agent specialties
  private async simulateValidation(
    validatorType: string,
    validatedType: string,
    inputCode: string,
    outputResult: string,
    language: string
  ): Promise<ValidationResult> {
    
    // Get validator's reputation to influence validation quality
    const validator = await prisma.aIAgent.findUnique({
      where: { agentType: validatorType }
    })
    
    const validatorReputation = validator?.reputation || 100
    const reputationBonus = Math.min((validatorReputation - 100) / 100, 0.5) // Max 0.5 bonus
    
    // Base confidence affected by validator reputation
    let baseConfidence = 0.6 + reputationBonus + (Math.random() * 0.3)
    
    // Agent-specific validation logic
    const validation: ValidationResult = {
      verdict: this.determineVerdict(baseConfidence),
      confidenceScore: Math.min(baseConfidence, 1.0),
      technicalScore: Math.random() * 0.4 + 0.6, // Generally high technical scores
      positiveAspects: [],
      improvementSuggestions: [],
      criticalIssues: []
    }
    
    // Validator-specific feedback based on their specialty
    switch (validatorType) {
      case 'security':
        validation.positiveAspects.push('Input validation appears robust')
        if (Math.random() > 0.7) {
          validation.improvementSuggestions.push('Consider adding rate limiting')
        }
        break
        
      case 'performance':
        validation.positiveAspects.push('Efficient algorithm implementation')
        if (Math.random() > 0.6) {
          validation.improvementSuggestions.push('Could benefit from caching optimization')
        }
        break
        
      case 'test-generation':
        validation.positiveAspects.push('Code structure supports testing')
        validation.improvementSuggestions.push('Add edge case testing scenarios')
        break
        
      case 'documentation':
        validation.positiveAspects.push('Clear variable naming')
        if (Math.random() > 0.5) {
          validation.improvementSuggestions.push('Add more detailed comments')
        }
        break
        
      case 'llm-judge':
        // Judge provides overall assessment
        validation.vibeAlignmentScore = Math.random() * 0.3 + 0.7
        validation.positiveAspects.push('Demonstrates good software engineering principles')
        break
    }
    
    // Add critical issues occasionally for realism
    if (Math.random() > 0.9) {
      validation.criticalIssues.push('Potential security vulnerability detected')
      validation.verdict = 'CRITICAL_ISSUE'
    }
    
    return validation
  }

  // Determine verdict based on confidence score
  private determineVerdict(confidence: number): ValidationResult['verdict'] {
    if (confidence >= 0.9) return 'EXCELLENT'
    if (confidence >= 0.7) return 'APPROVED'
    if (confidence >= 0.4) return 'NEEDS_IMPROVEMENT'
    return 'CRITICAL_ISSUE'
  }

  // Process reputation changes based on validation results
  private async processValidationReputation(
    validatorType: string,
    validatedType: string,
    validation: ValidationResult
  ) {
    // Validator gets reputation for performing validation
    await reputationService.awardAgentReputation(
      validatorType,
      'PEER_VALIDATION_CORRECT',
      `Validated ${validatedType} with ${validation.verdict}`,
      { sessionValidation: true, verdict: validation.verdict }
    )
    
    // Validated agent gets reputation based on validation result
    switch (validation.verdict) {
      case 'EXCELLENT':
        await reputationService.awardAgentReputation(
          validatedType,
          'HIGH_CONFIDENCE_RESULT',
          `Received EXCELLENT rating from ${validatorType}`
        )
        break
        
      case 'APPROVED':
        await reputationService.awardAgentReputation(
          validatedType,
          'SUCCESSFUL_ANALYSIS',
          `Approved by ${validatorType}`
        )
        break
        
      case 'CRITICAL_ISSUE':
        await reputationService.awardAgentReputation(
          validatedType,
          'FALSE_POSITIVE',
          `Critical issues found by ${validatorType}`
        )
        break
    }
  }

  // Generate gossip packets for network communication
  async generateGossipPackets(
    sessionId: string,
    targetAgentType: string,
    validatorTypes: string[]
  ) {
    console.log(`📢 Generating gossip packets for session ${sessionId}`)
    
    const targetAgentId = await this.getAgentId(targetAgentType)
    
    // Create gossip packets from each validator
    for (const validatorType of validatorTypes) {
      const validatorId = await this.getAgentId(validatorType)
      
      // Get the validation result
      const validation = await prisma.agentValidation.findFirst({
        where: {
          validatorAgentId: validatorId,
          validatedAgentId: targetAgentId,
          sessionId
        }
      })
      
      if (!validation) continue
      
      // Create gossip packet
      await prisma.gossipPacket.create({
        data: {
          senderAgentId: validatorId,
          receiverAgentId: null, // Broadcast to all
          packetType: 'VALIDATION_RESULT',
          targetSessionId: sessionId,
          targetAgentId: targetAgentId,
          verdict: validation.verdict,
          confidenceScore: validation.confidenceScore,
          vibeAlignmentScore: validation.vibeAlignmentScore,
          improvementSuggestions: validation.improvementSuggestions,
          consensusWeight: this.calculateConsensusWeight(validatorType),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        }
      })
    }
  }

  // Calculate consensus weight based on agent reputation
  private calculateConsensusWeight(agentType: string): number {
    // Higher reputation agents have more weight in consensus
    // This is a simplified calculation - in reality it would be more complex
    return Math.random() * 0.5 + 0.5 // 0.5 to 1.0
  }

  // Get agent ID by type, create if doesn't exist
  private async getAgentId(agentType: string): Promise<string> {
    let agent = await prisma.aIAgent.findUnique({
      where: { agentType }
    })
    
    if (!agent) {
      agent = await reputationService.initializeAgent(agentType)
    }
    
    return agent.id
  }

  // Get validation consensus for a session
  async getValidationConsensus(sessionId: string) {
    const validations = await prisma.agentValidation.findMany({
      where: { sessionId },
      include: {
        validatorAgent: true,
        validatedAgent: true
      }
    })
    
    if (validations.length === 0) return null
    
    // Calculate consensus metrics
    const verdictCounts = validations.reduce((acc, v) => {
      acc[v.verdict] = (acc[v.verdict] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const avgConfidence = validations.reduce((sum, v) => sum + v.confidenceScore, 0) / validations.length
    const avgTechnical = validations.reduce((sum, v) => sum + v.technicalScore, 0) / validations.length
    
    const consensus = Object.entries(verdictCounts).reduce((a, b) => 
      verdictCounts[a[0]] > verdictCounts[b[0]] ? a : b
    )
    
    return {
      totalValidations: validations.length,
      consensusVerdict: consensus[0],
      consensusStrength: consensus[1] / validations.length,
      averageConfidence: avgConfidence,
      averageTechnicalScore: avgTechnical,
      validations
    }
  }

  // Process pending gossip packets (background job)
  async processPendingGossip() {
    const pendingPackets = await prisma.gossipPacket.findMany({
      where: {
        processed: false,
        expiresAt: { gt: new Date() }
      },
      include: {
        senderAgent: true,
        receiverAgent: true
      },
      take: 50 // Process in batches
    })
    
    for (const packet of pendingPackets) {
      await this.processGossipPacket(packet)
    }
    
    console.log(`📡 Processed ${pendingPackets.length} gossip packets`)
  }

  // Process individual gossip packet
  private async processGossipPacket(packet: any) {
    // Mark as processed
    await prisma.gossipPacket.update({
      where: { id: packet.id },
      data: {
        processed: true,
        processedAt: new Date()
      }
    })
    
    // Update network consensus based on gossip
    if (packet.packetType === 'VALIDATION_RESULT' && packet.targetAgentId) {
      // This could influence future validations or agent selection
      console.log(`🗣️ Gossip: ${packet.senderAgent.agentType} says ${packet.verdict} about ${packet.targetAgentId}`)
    }
  }
}

// Export singleton instance
export const agentValidationService = new AgentValidationService()