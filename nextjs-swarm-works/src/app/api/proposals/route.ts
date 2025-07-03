import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposalData = await request.json()
    
    // Validate required fields
    const requiredFields = ['projectId', 'coverLetter', 'proposedBudget', 'estimatedTime', 'availability']
    for (const field of requiredFields) {
      if (!proposalData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if project exists and is open
    const project = await DatabaseService.getProjectById(proposalData.projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.status !== 'OPEN') {
      return NextResponse.json({ error: 'Project is not accepting proposals' }, { status: 400 })
    }

    // Check if user already submitted a proposal for this project
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId: proposalData.projectId,
        developerId: user.id
      }
    })

    if (existingProposal) {
      return NextResponse.json(
        { error: 'You have already submitted a proposal for this project' },
        { status: 400 }
      )
    }

    const proposal = await DatabaseService.createProposal({
      ...proposalData,
      developerId: user.id
    })

    return NextResponse.json(proposal, { status: 201 })
  } catch (error) {
    console.error('Error creating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (projectId) {
      // Get proposals for a specific project (only for project owner)
      const project = await DatabaseService.getProjectById(projectId)
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      if (project.clientId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      const proposals = await prisma.proposal.findMany({
        where: { projectId },
        include: {
          developer: true,
          milestones: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(proposals)
    } else {
      // Get user's proposals as developer
      const proposals = await DatabaseService.getUserProjects(user.id, 'developer')
      return NextResponse.json(proposals)
    }
  } catch (error) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    )
  }
}