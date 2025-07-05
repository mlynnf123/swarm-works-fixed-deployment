// Multi-Agent AI Service for Swarm Works
import { AgentType, AgentRequest, AgentResponse, OrchestrationRequest, OrchestrationResponse } from '@/types/ai-agents'

export class MultiAgentService {
  private baseUrl: string

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }

  // Individual Agent Methods
  async codeReview(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.CODE_REVIEW, { code, language, context })
  }

  async generateDocumentation(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.DOCUMENTATION, { code, language, context })
  }

  async generateTests(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.TEST_GENERATION, { code, language, context })
  }

  async analyzePerformance(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.PERFORMANCE, { code, language, context })
  }

  async analyzeSecurity(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.SECURITY, { code, language, context })
  }

  async llmJudge(code: string, language?: string, context?: string): Promise<AgentResponse> {
    return this.callAgent(AgentType.LLM_JUDGE, { code, language, context })
  }

  // Orchestration Method
  async orchestrateAnalysis(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/orchestrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Orchestration failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Orchestration error:', error)
      throw error
    }
  }

  // Complete Analysis (all agents)
  async completeAnalysis(code: string, language?: string): Promise<OrchestrationResponse> {
    return this.orchestrateAnalysis({
      code,
      language,
      agents: Object.values(AgentType),
      parallel: true
    })
  }

  // Custom Agent Selection
  async customAnalysis(
    code: string, 
    agents: AgentType[], 
    language?: string, 
    parallel: boolean = true
  ): Promise<OrchestrationResponse> {
    return this.orchestrateAnalysis({
      code,
      language,
      agents,
      parallel
    })
  }

  // Helper method to call individual agents
  protected async callAgent(agentType: AgentType, request: Omit<AgentRequest, 'agentType'>): Promise<AgentResponse> {
    try {
      const endpoint = this.getAgentEndpoint(agentType)
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Agent ${agentType} failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Agent ${agentType} error:`, error)
      throw error
    }
  }

  private getAgentEndpoint(agentType: AgentType): string {
    return `/api/ai/agents/${agentType}`
  }

  // Utility Methods
  async healthCheck(): Promise<{ status: string; agents: string[] }> {
    try {
      const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'
      const response = await fetch(`${aiServiceUrl}/health`)
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }

  // Batch processing for multiple code snippets
  async batchAnalysis(
    codeSnippets: Array<{ code: string; language?: string; id?: string }>,
    agentType: AgentType
  ): Promise<Array<AgentResponse & { id?: string }>> {
    const promises = codeSnippets.map(async (snippet) => {
      try {
        const result = await this.callAgent(agentType, {
          code: snippet.code,
          language: snippet.language
        })
        return { ...result, id: snippet.id }
      } catch (error) {
        return {
          agentType: agentType,
          result: `Error: ${error}`,
          confidence: 0,
          tokensUsed: 0,
          id: snippet.id
        } as AgentResponse & { id?: string }
      }
    })

    return Promise.all(promises)
  }

  // Progressive analysis (starts with quick agents, then detailed ones)
  async progressiveAnalysis(code: string, language?: string): Promise<{
    quick: AgentResponse[]
    detailed: AgentResponse[]
    summary: OrchestrationResponse
  }> {
    // Quick analysis first (performance and basic review)
    const quickAgents = [AgentType.PERFORMANCE, AgentType.CODE_REVIEW]
    const quickResults = await Promise.all(
      quickAgents.map(agent => this.callAgent(agent, { code, language }))
    )

    // Detailed analysis (security, documentation, tests)
    const detailedAgents = [AgentType.SECURITY, AgentType.DOCUMENTATION, AgentType.TEST_GENERATION]
    const detailedResults = await Promise.all(
      detailedAgents.map(agent => this.callAgent(agent, { code, language }))
    )

    // Complete summary
    const summary = await this.completeAnalysis(code, language)

    return {
      quick: quickResults,
      detailed: detailedResults,
      summary
    }
  }
}

// Export singleton instance
export const multiAgentService = new MultiAgentService()

// Legacy compatibility - update the existing AIService to use multi-agent
export class AIService extends MultiAgentService {
  // Backwards compatibility method
  async analyzeCode(request: { code: string; language?: string; task?: string }): Promise<any> {
    const { code, language, task = 'review' } = request
    
    // Map legacy tasks to new agents
    const taskToAgent: Record<string, AgentType> = {
      'review': AgentType.CODE_REVIEW,
      'explain': AgentType.DOCUMENTATION,
      'test': AgentType.TEST_GENERATION,
      'suggest': AgentType.PERFORMANCE,
      'analyze': AgentType.CODE_REVIEW
    }
    
    const agentType = taskToAgent[task] || AgentType.CODE_REVIEW
    return this.callAgent(agentType, { code, language })
  }
}

// Export legacy instance for backwards compatibility
export const aiService = new AIService()