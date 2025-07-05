import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database table schemas for TypeScript
export interface AIAgent {
  id: string
  agentType: string
  name: string
  description: string
  reputation: number
  totalValidations: number
  successfulValidations: number
  averageConfidence: number
  isActive: boolean
  createdAt: string
  lastActiveAt: string
}

export interface ReputationEvent {
  id: string
  userId?: string
  agentId?: string
  eventType: string
  points: number
  reason: string
  metadata: any
  createdAt: string
}

export interface AgentValidation {
  id: string
  sessionId: string
  validatorAgentId: string
  validatedAgentId: string
  validationResult: any
  confidence: number
  consensusReached: boolean
  createdAt: string
}