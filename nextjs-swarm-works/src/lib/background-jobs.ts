// Background Jobs for Autonomous Agent Validation and Gossip Processing
import { agentValidationService } from './agent-validation'
import { reputationService } from './reputation'

export class BackgroundJobService {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  // Start background processing
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🔄 Starting background agent validation and gossip processing...')
    
    // Process gossip packets every 30 seconds
    this.intervalId = setInterval(async () => {
      try {
        await this.processBackgroundTasks()
      } catch (error) {
        console.error('Background job error:', error)
      }
    }, 30000) // 30 seconds
    
    // Initial run
    setTimeout(() => this.processBackgroundTasks(), 5000)
  }

  // Stop background processing
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('🛑 Stopped background agent validation processing')
  }

  // Process all background tasks
  private async processBackgroundTasks() {
    console.log('🔄 Running background tasks...')
    
    try {
      // Process pending gossip packets
      await agentValidationService.processPendingGossip()
      
      // Initialize agents if they don't exist
      await this.initializeAgentsIfNeeded()
      
      // Could add more tasks here:
      // - Clean up old gossip packets
      // - Update agent performance metrics
      // - Generate reputation reports
      
    } catch (error) {
      console.error('Background task error:', error)
    }
  }

  // Initialize AI agents if they don't exist
  private async initializeAgentsIfNeeded() {
    const agentTypes = [
      'code-review',
      'documentation', 
      'test-generation',
      'performance',
      'security',
      'llm-judge'
    ]
    
    for (const agentType of agentTypes) {
      try {
        await reputationService.initializeAgent(agentType)
      } catch (error) {
        // Agent probably already exists, which is fine
      }
    }
  }

  // Manually trigger validation for a session (for testing)
  async triggerValidation(sessionId: string, agentType: string) {
    try {
      console.log(`[JOBS] Manually triggering validation for session ${sessionId}`)
      await agentValidationService.triggerValidation(sessionId, agentType)
    } catch (error) {
      console.error('Manual validation trigger error:', error)
    }
  }

  // Get background job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      startedAt: this.intervalId ? new Date() : null
    }
  }
}

// Export singleton instance
export const backgroundJobService = new BackgroundJobService()

// Auto-start in production (server-side only)
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Delay start to allow app to fully initialize
  setTimeout(() => {
    backgroundJobService.start()
  }, 10000) // 10 seconds
}