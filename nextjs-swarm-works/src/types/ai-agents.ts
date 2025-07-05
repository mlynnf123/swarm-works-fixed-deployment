// AI Agent Types and Configurations for Swarm Works

export enum AgentType {
  CODE_REVIEW = 'code-review',
  DOCUMENTATION = 'documentation',
  TEST_GENERATION = 'test-generation',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  LLM_JUDGE = 'llm-judge'
}

export interface AgentConfig {
  type: AgentType
  name: string
  description: string
  model: string
  endpoint: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  capabilities: string[]
  icon: string
}

export interface AgentRequest {
  agentType: AgentType
  code: string
  language?: string
  context?: string
  options?: Record<string, any>
}

export interface AgentResponse {
  agentType: AgentType
  result: string
  confidence: number
  suggestions?: Array<{
    type: string
    description: string
    severity: 'info' | 'warning' | 'error' | 'critical'
    line?: number
    fix?: string
  }>
  metrics?: Record<string, any>
  tokensUsed: number
}

// Agent Configurations
export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  [AgentType.CODE_REVIEW]: {
    type: AgentType.CODE_REVIEW,
    name: 'Code Review Agent',
    description: 'Analyzes code quality, best practices, and potential improvements',
    model: 'codellama:7b-instruct',
    endpoint: '/api/ai/agents/code-review',
    temperature: 0.3,
    maxTokens: 2048,
    systemPrompt: `You are an expert code reviewer. Analyze the provided code for:
    - Code quality and readability
    - Best practices and conventions
    - Potential bugs or issues
    - Performance considerations
    - Maintainability
    
    Provide specific, actionable feedback with examples.`,
    capabilities: ['syntax-analysis', 'best-practices', 'bug-detection', 'style-guide'],
    icon: 'CR'
  },
  
  [AgentType.DOCUMENTATION]: {
    type: AgentType.DOCUMENTATION,
    name: 'Documentation Agent',
    description: 'Generates comprehensive documentation from code',
    model: 'codellama:7b-instruct',
    endpoint: '/api/ai/agents/documentation',
    temperature: 0.5,
    maxTokens: 3000,
    systemPrompt: `You are a technical documentation expert. Generate clear, comprehensive documentation for the provided code including:
    - Function/method descriptions
    - Parameter explanations
    - Return value documentation
    - Usage examples
    - Edge cases and limitations
    
    Use proper markdown formatting and be concise yet thorough.`,
    capabilities: ['jsdoc', 'markdown', 'api-docs', 'examples'],
    icon: 'DOC'
  },
  
  [AgentType.TEST_GENERATION]: {
    type: AgentType.TEST_GENERATION,
    name: 'Test Generation Agent',
    description: 'Creates unit tests and test scenarios',
    model: 'codellama:7b-code',
    endpoint: '/api/ai/agents/test-generation',
    temperature: 0.2,
    maxTokens: 2500,
    systemPrompt: `You are a testing expert. Generate comprehensive test cases for the provided code:
    - Unit tests covering all functions/methods
    - Edge cases and error scenarios
    - Mock data and fixtures
    - Test descriptions explaining what is being tested
    
    Use the appropriate testing framework for the language (Jest for JS, pytest for Python, etc).`,
    capabilities: ['unit-tests', 'integration-tests', 'mocks', 'coverage'],
    icon: 'TEST'
  },
  
  [AgentType.PERFORMANCE]: {
    type: AgentType.PERFORMANCE,
    name: 'Performance Agent',
    description: 'Analyzes and optimizes code performance',
    model: 'tinyllama:latest',
    endpoint: '/api/ai/agents/performance',
    temperature: 0.1,
    maxTokens: 2000,
    systemPrompt: `You are a performance optimization expert. Analyze the code for:
    - Time complexity issues
    - Memory usage problems
    - Potential bottlenecks
    - Optimization opportunities
    - Scalability concerns
    
    Provide specific optimization suggestions with before/after examples.`,
    capabilities: ['complexity-analysis', 'memory-profiling', 'optimization', 'benchmarking'],
    icon: 'PERF'
  },
  
  [AgentType.SECURITY]: {
    type: AgentType.SECURITY,
    name: 'Security Agent',
    description: 'Detects security vulnerabilities and suggests fixes',
    model: 'codellama:7b-instruct',
    endpoint: '/api/ai/agents/security',
    temperature: 0.1,
    maxTokens: 2000,
    systemPrompt: `You are a security expert. Analyze the code for:
    - Common vulnerabilities (OWASP Top 10)
    - SQL injection risks
    - XSS vulnerabilities
    - Authentication/authorization issues
    - Data exposure risks
    - Dependency vulnerabilities
    
    Provide severity ratings and specific remediation steps.`,
    capabilities: ['vulnerability-scan', 'owasp-check', 'auth-analysis', 'crypto-review'],
    icon: 'SEC'
  },
  
  [AgentType.LLM_JUDGE]: {
    type: AgentType.LLM_JUDGE,
    name: 'LLM Judge Agent',
    description: 'Provides comprehensive overall code quality assessment',
    model: 'mistral:7b-instruct',
    endpoint: '/api/ai/agents/llm-judge',
    temperature: 0.4,
    maxTokens: 2500,
    systemPrompt: `You are an expert AI judge evaluating code quality. Provide an overall assessment covering:
    - Overall code quality score (1-10)
    - Strengths and positive aspects
    - Critical issues that need immediate attention
    - Priority recommendations
    - Comparison to industry best practices
    
    Give balanced, constructive feedback suitable for code review.`,
    capabilities: ['overall-assessment', 'quality-score', 'priority-ranking', 'best-practices'],
    icon: 'JUDGE'
  }
}

// Agent Orchestration Types
export interface OrchestrationRequest {
  code: string
  language?: string
  agents: AgentType[]
  parallel?: boolean
}

export interface OrchestrationResponse {
  results: Record<AgentType, AgentResponse>
  summary: string
  overallScore: number
  criticalIssues: number
  suggestions: number
  executionTime: number
}