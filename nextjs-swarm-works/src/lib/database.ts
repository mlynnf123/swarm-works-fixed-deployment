import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions
export class DatabaseService {
  // User operations
  static async createUser(userData: {
    email: string
    name?: string
    username?: string
    githubId?: number
    image?: string
    role?: 'DEVELOPER' | 'CLIENT' | 'ADMIN'
  }) {
    return await prisma.user.create({
      data: userData
    })
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        clientProjects: true,
        proposals: true,
        reviewsReceived: true,
        reviewsGiven: true
      }
    })
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        clientProjects: true,
        proposals: true
      }
    })
  }

  static async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }

  // Project operations
  static async createProject(projectData: {
    title: string
    description: string
    category: string
    skills: string[]
    budgetType: string
    budgetMin: number
    budgetMax: number
    timeline: string
    experienceLevel: string
    clientId: string
    githubRepo?: string
    tags?: string[]
  }) {
    return await prisma.project.create({
      data: {
        ...projectData,
        budgetMin: projectData.budgetMin,
        budgetMax: projectData.budgetMax,
        category: projectData.category as any,
        budgetType: projectData.budgetType as any,
        experienceLevel: projectData.experienceLevel as any,
      },
      include: {
        client: true,
        proposals: {
          include: {
            developer: true
          }
        }
      }
    })
  }

  static async getProjects(filters?: {
    category?: string
    budgetMin?: number
    budgetMax?: number
    experienceLevel?: string
    skills?: string[]
    status?: string
  }) {
    return await prisma.project.findMany({
      where: {
        status: 'OPEN',
        ...(filters?.category && { category: filters.category as any }),
        ...(filters?.budgetMin && { budgetMin: { gte: filters.budgetMin } }),
        ...(filters?.budgetMax && { budgetMax: { lte: filters.budgetMax } }),
        ...(filters?.experienceLevel && { experienceLevel: filters.experienceLevel as any }),
        ...(filters?.skills && { skills: { hasSome: filters.skills } }),
      },
      include: {
        client: true,
        proposals: true,
        _count: {
          select: { proposals: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async getProjectById(id: string) {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        proposals: {
          include: {
            developer: true,
            milestones: true
          }
        },
        attachments: true,
        messages: {
          include: {
            sender: true,
            receiver: true
          }
        },
        reviews: {
          include: {
            reviewer: true,
            reviewee: true
          }
        }
      }
    })
  }

  static async getUserProjects(userId: string, role: 'client' | 'developer') {
    if (role === 'client') {
      return await prisma.project.findMany({
        where: { clientId: userId },
        include: {
          proposals: {
            include: {
              developer: true
            }
          },
          _count: {
            select: { proposals: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      return await prisma.proposal.findMany({
        where: { developerId: userId },
        include: {
          project: {
            include: {
              client: true
            }
          },
          milestones: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }
  }

  // Proposal operations
  static async createProposal(proposalData: {
    projectId: string
    developerId: string
    coverLetter: string
    proposedBudget: number
    estimatedTime: string
    availability: string
    githubSamples?: string[]
  }) {
    return await prisma.proposal.create({
      data: {
        ...proposalData,
        proposedBudget: proposalData.proposedBudget,
        githubSamples: proposalData.githubSamples || []
      },
      include: {
        developer: true,
        project: true
      }
    })
  }

  static async updateProposalStatus(proposalId: string, status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED') {
    return await prisma.proposal.update({
      where: { id: proposalId },
      data: { status },
      include: {
        developer: true,
        project: true
      }
    })
  }

  // Review operations
  static async createReview(reviewData: {
    projectId: string
    reviewerId: string
    revieweeId: string
    rating: number
    title: string
    comment: string
  }) {
    return await prisma.review.create({
      data: reviewData,
      include: {
        reviewer: true,
        reviewee: true,
        project: true
      }
    })
  }

  // Message operations
  static async createMessage(messageData: {
    projectId: string
    senderId: string
    receiverId: string
    content: string
    type?: 'TEXT' | 'FILE' | 'MILESTONE_UPDATE' | 'PAYMENT_UPDATE'
  }) {
    return await prisma.message.create({
      data: {
        ...messageData,
        type: messageData.type || 'TEXT'
      },
      include: {
        sender: true,
        receiver: true,
        project: true
      }
    })
  }

  static async getProjectMessages(projectId: string) {
    return await prisma.message.findMany({
      where: { projectId },
      include: {
        sender: true,
        receiver: true
      },
      orderBy: { createdAt: 'asc' }
    })
  }

  // Analytics and stats
  static async getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientProjects: true,
        proposals: true,
        reviewsReceived: true
      }
    })

    if (!user) return null

    const totalProjects = user.clientProjects.length
    const totalProposals = user.proposals.length
    const averageRating = user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / user.reviewsReceived.length
      : 0

    return {
      user,
      stats: {
        totalProjects,
        totalProposals,
        averageRating: Math.round(averageRating * 10) / 10,
        reputation: user.reputation,
        totalEarnings: user.totalEarnings,
        totalSpent: user.totalSpent
      }
    }
  }

  // Search functionality
  static async searchProjects(query: string) {
    return await prisma.project.findMany({
      where: {
        status: 'OPEN',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { skills: { hasSome: [query] } },
          { tags: { hasSome: [query] } }
        ]
      },
      include: {
        client: true,
        _count: {
          select: { proposals: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}