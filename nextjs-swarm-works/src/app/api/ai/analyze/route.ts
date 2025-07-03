import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { aiService } from '@/lib/ai-service'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, language, task = 'analyze', agentType = 'general' } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    // Track AI usage in database
    const aiSession = await prisma.aISession.create({
      data: {
        userId: user.id,
        agentType,
        task,
        inputCode: code,
        language: language || 'javascript',
        status: 'processing'
      }
    })

    try {
      // Call AI service
      const response = await aiService.analyzeCode({
        code,
        language,
        task: task as any
      })

      // Update session with results
      await prisma.aISession.update({
        where: { id: aiSession.id },
        data: {
          outputResult: response.output,
          tokensUsed: response.tokens_used,
          status: 'completed',
          completedAt: new Date()
        }
      })

      // Format response for UI
      const formattedResponse = {
        id: aiSession.id,
        agentType,
        task,
        timestamp: new Date().toISOString(),
        ...response,
        suggestions: task === 'review' || task === 'suggest' ? 
          (response.suggestions || parseCodeSuggestions(response.output)) : 
          undefined
      }

      return NextResponse.json(formattedResponse)

    } catch (aiError) {
      // Update session with error
      await prisma.aISession.update({
        where: { id: aiSession.id },
        data: {
          status: 'failed',
          error: aiError instanceof Error ? aiError.message : 'AI service error'
        }
      })
      throw aiError
    }

  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    )
  }
}

// Helper function to parse suggestions from AI output
function parseCodeSuggestions(output: string) {
  const suggestions = []
  
  // Mock parsing for demo - replace with actual parsing logic
  const lines = output.split('\n')
  lines.forEach((line, index) => {
    if (line.includes('Error:') || line.includes('Bug:')) {
      suggestions.push({
        type: 'error',
        line: index + 1,
        description: line.replace(/^.*?(Error|Bug):\s*/i, ''),
        confidence: 0.9
      })
    } else if (line.includes('Warning:') || line.includes('Issue:')) {
      suggestions.push({
        type: 'warning',
        line: index + 1,
        description: line.replace(/^.*?(Warning|Issue):\s*/i, ''),
        confidence: 0.8
      })
    } else if (line.includes('Suggestion:') || line.includes('Improvement:')) {
      suggestions.push({
        type: 'optimization',
        line: index + 1,
        description: line.replace(/^.*?(Suggestion|Improvement):\s*/i, ''),
        confidence: 0.7
      })
    }
  })

  return suggestions
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's AI session history
    const sessions = await prisma.aISession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json(sessions)

  } catch (error) {
    console.error('Error fetching AI sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI sessions' },
      { status: 500 }
    )
  }
}