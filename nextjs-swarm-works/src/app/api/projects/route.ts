import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const category = searchParams.get('category') || undefined
    const budgetMin = searchParams.get('budgetMin') ? Number(searchParams.get('budgetMin')) : undefined
    const budgetMax = searchParams.get('budgetMax') ? Number(searchParams.get('budgetMax')) : undefined
    const experienceLevel = searchParams.get('experienceLevel') || undefined
    const skills = searchParams.get('skills')?.split(',') || undefined
    const search = searchParams.get('search') || undefined

    let projects

    if (search) {
      projects = await DatabaseService.searchProjects(search)
    } else {
      projects = await DatabaseService.getProjects({
        category,
        budgetMin,
        budgetMax,
        experienceLevel,
        skills
      })
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectData = await request.json()
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'budgetType', 'budgetMin', 'budgetMax', 'timeline', 'experienceLevel']
    for (const field of requiredFields) {
      if (!projectData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const project = await DatabaseService.createProject({
      ...projectData,
      clientId: user.id,
      skills: projectData.skills || [],
      tags: projectData.tags || []
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}