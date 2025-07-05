import { NextRequest, NextResponse } from 'next/server'
import { AgentType } from '@/types/ai-agents'

export async function POST(request: NextRequest) {
  try {
    const { code, language = 'javascript', context } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    const aiServiceUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'
    
    const response = await fetch(`${aiServiceUrl}/agent/llm-judge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        context
      })
    })

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status}`)
    }

    const result = await response.json()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('LLM Judge Agent error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    )
  }
}