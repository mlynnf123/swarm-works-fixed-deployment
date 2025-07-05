'use client'

import { useState } from 'react'
import { AgentType, OrchestrationResponse } from '@/types/ai-agents'
import { multiAgentService } from '@/lib/ai-agents-service'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Play } from 'lucide-react'

const AGENT_CONFIGS = {
  [AgentType.CODE_REVIEW]: {
    name: 'Code Review',
    icon: 'CR',
    description: 'Analyze code quality and best practices'
  },
  [AgentType.DOCUMENTATION]: {
    name: 'Documentation',
    icon: 'DOC',
    description: 'Generate comprehensive documentation'
  },
  [AgentType.TEST_GENERATION]: {
    name: 'Test Generation',
    icon: 'TEST',
    description: 'Create unit tests and scenarios'
  },
  [AgentType.PERFORMANCE]: {
    name: 'Performance',
    icon: 'PERF',
    description: 'Optimize code performance'
  },
  [AgentType.SECURITY]: {
    name: 'Security',
    icon: 'SEC',
    description: 'Detect security vulnerabilities'
  },
  [AgentType.LLM_JUDGE]: {
    name: 'LLM Judge',
    icon: 'JUDGE',
    description: 'Overall code assessment'
  }
}

interface AgentOrchestratorProps {
  initialCode?: string
  initialLanguage?: string
}

export function AgentOrchestrator({ initialCode = '', initialLanguage = 'javascript' }: AgentOrchestratorProps) {
  const [code, setCode] = useState(initialCode)
  const [language, setLanguage] = useState(initialLanguage)
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>(Object.values(AgentType))
  const [parallel, setParallel] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<OrchestrationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAgentToggle = (agentType: AgentType, checked: boolean) => {
    if (checked) {
      setSelectedAgents(prev => [...prev, agentType])
    } else {
      setSelectedAgents(prev => prev.filter(a => a !== agentType))
    }
  }

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze')
      return
    }

    if (selectedAgents.length === 0) {
      setError('Please select at least one agent')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResults(null)

    try {
      const response = await multiAgentService.orchestrateAnalysis({
        code,
        language,
        agents: selectedAgents,
        parallel
      })
      setResults(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Code to Analyze</label>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="min-h-[200px] font-mono"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="go">Go</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select AI Agents</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(AGENT_CONFIGS).map(([agentType, config]) => (
                <div key={agentType} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedAgents.includes(agentType as AgentType)}
                    onCheckedChange={(checked) => 
                      handleAgentToggle(agentType as AgentType, checked as boolean)
                    }
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-gray-100 px-1 py-0.5 rounded">{config.icon}</span>
                      <span className="font-medium text-sm">{config.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{config.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Mode */}
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={parallel}
              onCheckedChange={setParallel}
            />
            <label className="text-sm font-medium">
              Run agents in parallel (faster but uses more resources)
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !code.trim() || selectedAgents.length === 0}
              className="min-w-32"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setCode('')
                setResults(null)
                setError(null)
              }}
            >
              Clear
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Panel */}
      {results && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">{results.summary}</p>
                
                {/* Individual Agent Results */}
                <div className="space-y-3">
                  {results.results?.map((result, index) => {
                    const config = AGENT_CONFIGS[result.agent_type as AgentType]
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xs font-mono font-bold bg-gray-100 px-1 py-0.5 rounded">{config?.icon || 'AI'}</span>
                          <span className="font-medium">{config?.name || result.agent_type}</span>
                          <Badge variant="outline">
                            {Math.round(result.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm">
                            {result.analysis}
                          </pre>
                        </div>
                        
                        {result.suggestions && result.suggestions.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium mb-2">Suggestions:</h4>
                            <ul className="text-sm space-y-1">
                              {result.suggestions.map((suggestion, idx) => (
                                <li key={idx} className="text-gray-600">• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Execution time: {result.execution_time.toFixed(2)}s
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}