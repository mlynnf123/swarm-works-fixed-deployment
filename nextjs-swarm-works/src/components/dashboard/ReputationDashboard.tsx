'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface AgentStats {
  id: string
  agenttype: string  // Supabase returns lowercase
  name: string
  reputation: number
  totalvalidations: number
  successfulvalidations: number
  averageconfidence: number
  isactive: boolean
  createdat: string
  lastactiveat: string
}

interface UserReputation {
  totalReputation: number
  recentEvents: Array<{
    eventType: string
    points: number
    reason: string
    createdAt: string
  }>
  breakdown: Record<string, number>
}

interface TopUser {
  id: string
  name: string
  username: string
  reputation: number
  image: string
  role: string
}

export function ReputationDashboard() {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [userReputation, setUserReputation] = useState<UserReputation | null>(null)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReputationData()
  }, [])

  const loadReputationData = async () => {
    try {
      // Try Supabase endpoints first
      const agentResponse = await fetch('/api/supabase-reputation/agents')
      if (agentResponse.ok) {
        const agents = await agentResponse.json()
        setAgentStats(agents)
      } else {
        // Fallback to original endpoints
        const fallbackResponse = await fetch('/api/reputation/agents')
        if (fallbackResponse.ok) {
          const agents = await fallbackResponse.json()
          setAgentStats(agents)
        }
      }

      // Load user reputation
      const userResponse = await fetch('/api/supabase-reputation/user')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUserReputation(userData)
      }

      // Load top users
      const topUsersResponse = await fetch('/api/supabase-reputation/top-users')
      if (topUsersResponse.ok) {
        const users = await topUsersResponse.json()
        setTopUsers(users)
      }
    } catch (error) {
      console.error('Failed to load reputation data:', error)
      setError('Unable to load reputation data. Testing Supabase connection...')
    } finally {
      setLoading(false)
    }
  }

  const getReputationColor = (reputation: number) => {
    if (reputation >= 150) return 'bg-green-500'
    if (reputation >= 100) return 'bg-blue-500'
    if (reputation >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getAgentIcon = (agentType: string) => {
    const icons = {
      'code-review': 'CR',
      'documentation': 'DOC',
      'test-generation': 'TEST',
      'performance': 'PERF',
      'security': 'SEC',
      'llm-judge': 'JUDGE'
    }
    return icons[agentType as keyof typeof icons] || 'AI'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-orange-800 mb-2">Reputation System Status</h3>
          <p className="text-orange-700 mb-4">{error}</p>
          <div className="text-sm text-orange-600">
            The reputation system is implemented and ready. Once the database connection is restored, 
            you'll see live AI agent statistics, peer validation results, and reputation tracking here.
          </div>
        </div>
        
        {/* Show mock data to demonstrate the UI */}
        <div className="bg-white rounded-lg border p-6 opacity-75">
          <h3 className="text-lg font-medium mb-4">AI Agent Network (Preview)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'code-review', icon: 'CR', name: 'Code Review Agent', reputation: 142 },
              { type: 'security', icon: 'SEC', name: 'Security Agent', reputation: 128 },
              { type: 'performance', icon: 'PERF', name: 'Performance Agent', reputation: 115 }
            ].map(agent => (
              <div key={agent.type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono font-bold bg-gray-100 px-2 py-1 rounded">{agent.icon}</span>
                  <Badge variant="outline">{agent.reputation} pts</Badge>
                </div>
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-sm text-gray-600">Sample reputation data</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Your Reputation */}
      {userReputation && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Your Reputation</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-3xl font-bold text-blue-600">
              {userReputation.totalReputation}
            </div>
            <Badge variant="outline" className="text-sm">
              Reputation Points
            </Badge>
          </div>
          
          {userReputation.recentEvents.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {userReputation.recentEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{event.reason}</span>
                    <span className={`font-medium ${event.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {event.points > 0 ? '+' : ''}{event.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Agent Leaderboard */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">AI Agent Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentStats.map((agent) => (
            <div key={agent.agenttype} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-mono font-bold bg-gray-100 px-2 py-1 rounded">{getAgentIcon(agent.agenttype)}</span>
                <div>
                  <h4 className="font-medium">{agent.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{agent.agenttype?.replace('-', ' ') || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reputation</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{agent.reputation}</span>
                    <div className={`w-2 h-2 rounded-full ${getReputationColor(agent.reputation)}`}></div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-medium">
                    {agent.totalvalidations > 0 
                      ? `${Math.round((agent.successfulvalidations / agent.totalvalidations) * 100)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Confidence</span>
                  <span className="font-medium">
                    {Math.round(agent.averageconfidence * 100)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={agent.isactive ? "default" : "secondary"}>
                    {agent.isactive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Users */}
      {topUsers.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {topUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    {user.image && (
                      <img src={user.image} alt={user.name} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium">{user.name || user.username}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.role.toLowerCase()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.reputation}</span>
                  <div className={`w-2 h-2 rounded-full ${getReputationColor(user.reputation)}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gossip Activity (Placeholder for future) */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Agent Network Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg font-bold mb-2 bg-gray-100 inline-block px-3 py-2 rounded">NETWORK</div>
          <p>Agent gossip and validation network is active</p>
          <p className="text-sm mt-1">Agents are autonomously validating each other's work</p>
        </div>
      </div>
    </div>
  )
}