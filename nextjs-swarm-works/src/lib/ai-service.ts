// AI Service Client for CodeLlama Integration
// This connects your Next.js app to the CodeLlama API running on DigitalOcean

export interface AIAnalysisRequest {
  code: string
  language?: string
  task: 'analyze' | 'review' | 'explain' | 'test' | 'suggest'
  context?: string
}

export interface AIAnalysisResponse {
  output: string
  task: string
  tokens_used: number
  confidence?: number
  suggestions?: Array<{
    type: string
    description: string
    severity: 'info' | 'warning' | 'error'
    line?: number
  }>
}

export class AIService {
  private baseUrl: string
  private apiKey?: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'
    this.apiKey = process.env.AI_SERVICE_API_KEY
  }

  async analyzeCode(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          prompt: this.formatPrompt(request),
          task: request.task,
          max_tokens: 2048,
          temperature: request.task === 'test' ? 0.3 : 0.1
        })
      })

      if (!response.ok) {
        throw new Error(`AI Service error: ${response.status}`)
      }

      const data = await response.json()
      
      // Parse and enhance the response
      return this.enhanceResponse(data, request.task)
    } catch (error) {
      console.error('AI Service error:', error)
      throw error
    }
  }

  private formatPrompt(request: AIAnalysisRequest): string {
    const { code, language, context } = request
    
    let prompt = ''
    
    if (context) {
      prompt += `Context: ${context}\n\n`
    }
    
    if (language) {
      prompt += `Language: ${language}\n\n`
    }
    
    prompt += `Code:\n\`\`\`${language || ''}\n${code}\n\`\`\``
    
    return prompt
  }

  private enhanceResponse(rawResponse: any, task: string): AIAnalysisResponse {
    const response: AIAnalysisResponse = {
      output: rawResponse.output,
      task: rawResponse.task,
      tokens_used: rawResponse.tokens_used
    }

    // Parse suggestions from the output for certain tasks
    if (task === 'review' || task === 'suggest') {
      response.suggestions = this.parseSuggestions(rawResponse.output)
    }

    // Add confidence scoring
    if (task === 'analyze') {
      response.confidence = this.calculateConfidence(rawResponse.output)
    }

    return response
  }

  private parseSuggestions(output: string): AIAnalysisResponse['suggestions'] {
    const suggestions: AIAnalysisResponse['suggestions'] = []
    
    // Simple pattern matching for common suggestion formats
    const patterns = [
      { regex: /\*\*Error\*\*:?\s*(.+)/gi, severity: 'error' as const },
      { regex: /\*\*Warning\*\*:?\s*(.+)/gi, severity: 'warning' as const },
      { regex: /\*\*Suggestion\*\*:?\s*(.+)/gi, severity: 'info' as const },
      { regex: /\d+\.\s*(.+)/g, severity: 'info' as const }
    ]

    patterns.forEach(({ regex, severity }) => {
      let match
      while ((match = regex.exec(output)) !== null) {
        suggestions.push({
          type: severity === 'error' ? 'bug' : severity === 'warning' ? 'improvement' : 'suggestion',
          description: match[1].trim(),
          severity
        })
      }
    })

    return suggestions
  }

  private calculateConfidence(output: string): number {
    // Simple heuristic for confidence based on response characteristics
    const factors = {
      hasExplanation: output.length > 200 ? 0.3 : 0,
      hasCodeExamples: output.includes('```') ? 0.2 : 0,
      hasStructuredOutput: /\d+\.|•|-/.test(output) ? 0.2 : 0,
      isDetailed: output.split('\n').length > 5 ? 0.2 : 0,
      baseline: 0.1
    }

    const confidence = Object.values(factors).reduce((sum, val) => sum + val, 0)
    return Math.min(confidence, 1)
  }

  // Specialized methods for each agent type
  async reviewCode(code: string, language?: string): Promise<AIAnalysisResponse> {
    return this.analyzeCode({ code, language, task: 'review' })
  }

  async explainCode(code: string, language?: string): Promise<AIAnalysisResponse> {
    return this.analyzeCode({ code, language, task: 'explain' })
  }

  async generateTests(code: string, language?: string): Promise<AIAnalysisResponse> {
    return this.analyzeCode({ code, language, task: 'test' })
  }

  async suggestImprovements(code: string, language?: string): Promise<AIAnalysisResponse> {
    return this.analyzeCode({ code, language, task: 'suggest' })
  }
}

// Export singleton instance
export const aiService = new AIService()