// Marketplace Type Definitions for Swarm Works

export type ProjectCategory = 
  | 'BUG_FIX'
  | 'NEW_FEATURE'
  | 'FULL_PROJECT'
  | 'CODE_REVIEW'
  | 'REFACTORING'
  | 'DOCUMENTATION'
  | 'TESTING'
  | 'DEPLOYMENT';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type ProposalStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected';

export type BudgetType = 'fixed' | 'hourly';

export interface BudgetRange {
  type: BudgetType;
  min: number;
  max: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'blockchain' | 'mobile' | 'devops' | 'ai_ml';
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  verified: boolean;
  totalSpent: number;
  projectsPosted: number;
  memberSince: string;
  location?: string;
  company?: string;
  timezone: string;
}

export interface DeveloperProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  verified: boolean;
  completedProjects: number;
  totalEarnings: number;
  skills: string[];
  location: string;
  timezone: string;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  githubUsername?: string;
  portfolio: string[];
  languages: string[];
  certifications: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  skills: string[];
  budget: BudgetRange;
  timeline: string;
  experienceLevel: ExperienceLevel;
  postedBy: ClientProfile;
  postedAt: string;
  updatedAt: string;
  status: ProjectStatus;
  githubRepo?: string;
  attachments: ProjectAttachment[];
  proposalCount: number;
  averageBid?: number;
  invitesSent: number;
  tags: string[];
  requirements: ProjectRequirement[];
}

export interface ProjectAttachment {
  id: string;
  filename: string;
  url: string;
  type: 'document' | 'image' | 'design' | 'other';
  size: number;
  uploadedAt: string;
}

export interface ProjectRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'must_have' | 'nice_to_have' | 'optional';
  category: 'functional' | 'technical' | 'design' | 'performance';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  duration: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deliverables: string[];
  dueDate?: string;
  completedAt?: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  developer: DeveloperProfile;
  coverLetter: string;
  proposedBudget: number;
  estimatedTime: string;
  milestones: Milestone[];
  githubSamples: string[];
  availability: string;
  submittedAt: string;
  status: ProposalStatus;
  questions: ProposalQuestion[];
  terms: ProposalTerms;
}

export interface ProposalQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface ProposalTerms {
  startDate: string;
  revisions: number;
  communicationMethod: 'email' | 'slack' | 'discord' | 'platform';
  workingHours: string;
  deliveryFormat: string;
  additionalServices: string[];
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  developerId: string;
  sentBy: string;
  sentAt: string;
  message: string;
  status: 'sent' | 'viewed' | 'accepted' | 'declined';
  expiresAt: string;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  type: 'text' | 'file' | 'milestone_update' | 'payment_update';
  attachments: MessageAttachment[];
  readAt?: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  title: string;
  comment: string;
  categories: ReviewCategory[];
  createdAt: string;
  helpful: number;
}

export interface ReviewCategory {
  name: string;
  rating: number;
}

export interface Payment {
  id: string;
  projectId: string;
  milestoneId?: string;
  amount: number;
  currency: 'USD' | 'SWARM';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'paypal' | 'crypto' | 'swarm_token';
  createdAt: string;
  completedAt?: string;
  transactionId?: string;
  fees: PaymentFee[];
}

export interface PaymentFee {
  type: 'platform' | 'payment_processor' | 'tax';
  amount: number;
  percentage: number;
}

export interface Dispute {
  id: string;
  projectId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  evidence: DisputeEvidence[];
}

export interface DisputeEvidence {
  id: string;
  type: 'text' | 'file' | 'screenshot';
  content: string;
  submittedBy: string;
  submittedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter and Search Types
export interface ProjectFilters {
  category?: ProjectCategory[];
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: BudgetType;
  experienceLevel?: ExperienceLevel[];
  timeline?: string[];
  location?: string[];
  postedWithin?: 'day' | 'week' | 'month';
  hasGithubRepo?: boolean;
  verified?: boolean;
}

export interface ProjectSearchParams extends ProjectFilters {
  query?: string;
  sortBy?: 'newest' | 'budget_high' | 'budget_low' | 'proposals_low' | 'proposals_high';
  page?: number;
  limit?: number;
}

// Dashboard Statistics
export interface DeveloperStats {
  totalEarnings: number;
  completedProjects: number;
  averageRating: number;
  activeProposals: number;
  responseRate: number;
  onTimeDelivery: number;
  repeatClients: number;
  skillsInDemand: string[];
}

export interface ClientStats {
  totalSpent: number;
  postedProjects: number;
  completedProjects: number;
  averageRating: number;
  averageTimeToHire: number;
  topSkillsHired: string[];
  savedDevelopers: number;
}

export interface PlatformStats {
  totalProjects: number;
  activeProjects: number;
  totalDevelopers: number;
  activeDevelopers: number;
  totalClients: number;
  activeClients: number;
  totalTransactionVolume: number;
  averageProjectValue: number;
  successRate: number;
}

// Form Data Types
export interface ProjectFormData {
  title: string;
  description: string;
  category: ProjectCategory;
  skills: string[];
  budget: BudgetRange;
  timeline: string;
  experienceLevel: ExperienceLevel;
  githubRepo?: string;
  attachments: File[];
  requirements: Omit<ProjectRequirement, 'id'>[];
  tags: string[];
}

export interface ProposalFormData {
  coverLetter: string;
  proposedBudget: string;
  estimatedTime: string;
  milestones: Omit<Milestone, 'id' | 'status' | 'completedAt'>[];
  githubSamples: string[];
  availability: string;
  questions: Omit<ProposalQuestion, 'id'>[];
  terms: ProposalTerms;
}