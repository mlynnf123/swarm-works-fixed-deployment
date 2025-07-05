import { NextRequest, NextResponse } from 'next/server'
import { AgentType } from '@/types/ai-agents'

export async function POST(request: NextRequest) {
  try {
    const { 
      code, 
      language = 'javascript', 
      agents = Object.values(AgentType),
      parallel = true 
    } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${aiServiceUrl}/orchestrator/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        agents,
        parallel
      })
    })

    if (!response.ok) {
      throw new Error(`AI orchestration error: ${response.status}`)
    }

    const result = await response.json()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Orchestration error:', error)
    return NextResponse.json(
      { error: 'Failed to orchestrate AI agents' },
      { status: 500 }
    )
  }
}