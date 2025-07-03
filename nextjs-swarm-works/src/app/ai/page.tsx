'use client'

import React, { useState } from 'react'

export default function AIPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [activeTab, setActiveTab] = useState<'suggestions' | 'review' | 'explanation' | 'tests'>('suggestions')

  const aiAgents = [
    {
      id: 'reactbot',
      name: 'ReactBot',
      specialty: 'React & Frontend',
      level: 'Expert',
      description: 'Specialized in React, TypeScript, and modern frontend development'
    },
    {
      id: 'backendguru',
      name: 'BackendGuru',
      specialty: 'Backend & APIs',
      level: 'Expert',
      description: 'Expert in Node.js, databases, and API architecture'
    },
    {
      id: 'codereviewer',
      name: 'CodeReviewer',
      specialty: 'Code Quality',
      level: 'Senior',
      description: 'Focused on code review, best practices, and optimization'
    },
    {
      id: 'mentorbot',
      name: 'MentorBot',
      specialty: 'Learning & Growth',
      level: 'Mentor',
      description: 'Helps with learning paths and skill development'
    }
  ]

  const mockSuggestions = [
    {
      title: 'Add useCallback for performance',
      description: 'Event handlers should be memoized to prevent child re-renders',
      type: 'Optimization',
      confidence: '85% confident',
      code: 'const handleClick = useCallback(() => { setCount(count + 1) }, [count])'
    },
    {
      title: 'Extract custom hook',
      description: 'Consider extracting state logic into a reusable custom hook',
      type: 'Best Practice',
      confidence: '78% confident',
      code: 'const useCounter = (initialValue = 0) => { const [count, setCount] = useState(initialValue); const increment = useCallback(() => setCount(c => c + 1), []); return { count, increment } }'
    }
  ]

  const capabilities = [
    {
      icon: '🔍',
      title: 'Code Analysis',
      description: 'Deep analysis of code structure, patterns, and potential improvements'
    },
    {
      icon: '💡',
      title: 'Smart Suggestions',
      description: 'Intelligent recommendations for optimization and best practices'
    },
    {
      icon: '🧪',
      title: 'Test Generation',
      description: 'Automatic generation of comprehensive unit and integration tests'
    },
    {
      icon: '📝',
      title: 'Documentation',
      description: 'Generate clear documentation and code explanations'
    }
  ]

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-section-title mb-2">
            AI ASSISTANT
            <span className="block w-16 h-0.5 bg-black mt-4"></span>
          </h1>
          <p className="text-gray-600 mt-4 text-body">
            Intelligent coding assistance from specialized AI agents
          </p>
        </div>

        {/* AI Agent Selection */}
        <div className="mb-12">
          <h2 className="text-xl font-light tracking-wider uppercase mb-6">Select AI Agent</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`text-left p-6 border transition-colors ${
                  selectedAgent === agent.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black'
                }`}
              >
                <h3 className="font-normal text-lg mb-2">{agent.name}</h3>
                <p className="text-sm mb-1 opacity-80">{agent.specialty}</p>
                <p className="text-sm mb-3 opacity-80">{agent.level}</p>
                <p className="text-sm font-light opacity-70">{agent.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Code Input Section */}
          <div>
            <div className="swarm-card p-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">Code Input</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm uppercase tracking-wider mb-3 font-normal">Paste your code</div>
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="w-full h-48 px-4 py-3 border border-gray-300 bg-gray-50 focus:outline-none focus:border-black font-mono text-sm"
                    placeholder="// Paste your code here for analysis..."
                  />
                </div>
                <button 
                  className={`w-full py-3 text-sm uppercase tracking-wider transition-colors ${
                    codeInput.trim() && selectedAgent
                      ? 'swarm-button-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!codeInput.trim() || !selectedAgent}
                >
                  ANALYZE CODE
                </button>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div>
            <div className="swarm-card p-6">
              <h2 className="text-xl font-light tracking-wider uppercase mb-6">AI Analysis</h2>
              
              {/* Analysis Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { key: 'suggestions', label: 'Suggestions (2)' },
                  { key: 'review', label: 'Review (0)' },
                  { key: 'explanation', label: 'Explanation' },
                  { key: 'tests', label: 'Tests' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2 text-sm uppercase tracking-wider transition-colors ${
                      activeTab === tab.key
                        ? 'border-b-2 border-black text-black'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                {activeTab === 'suggestions' && (
                  <>
                    {mockSuggestions.map((suggestion, index) => (
                      <div key={index} className="border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-normal mb-1">{suggestion.title}</h3>
                            <p className="text-sm text-gray-600 font-light mb-2">{suggestion.description}</p>
                            <span className="text-xs uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-1">
                              {suggestion.type}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 font-light">{suggestion.confidence}</span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200">
                          <code className="text-sm font-mono text-gray-800">{suggestion.code}</code>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                
                {activeTab !== 'suggestions' && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="font-light">
                      {selectedAgent && codeInput.trim() 
                        ? 'Click "Analyze Code" to generate results' 
                        : 'Select an AI agent and paste your code to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Capabilities Section */}
        <div className="mt-16">
          <h2 className="text-xl font-light tracking-wider uppercase mb-8 text-center">AI Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{capability.icon}</div>
                <h3 className="font-normal text-lg mb-2 tracking-wider uppercase">{capability.title}</h3>
                <p className="text-gray-600 font-light text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}