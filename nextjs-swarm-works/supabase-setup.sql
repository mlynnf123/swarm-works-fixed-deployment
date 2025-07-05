-- Supabase SQL Setup for Reputation System
-- Run this in your Supabase SQL Editor

-- Create ai_agents table
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agentType TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  reputation INTEGER DEFAULT 100,
  totalValidations INTEGER DEFAULT 0,
  successfulValidations INTEGER DEFAULT 0,
  averageConfidence DECIMAL DEFAULT 0.0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lastActiveAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reputation_events table
CREATE TABLE IF NOT EXISTS reputation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID,
  agentId UUID REFERENCES ai_agents(id),
  eventType TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_validations table
CREATE TABLE IF NOT EXISTS agent_validations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sessionId TEXT NOT NULL,
  validatorAgentId UUID REFERENCES ai_agents(id),
  validatedAgentId UUID REFERENCES ai_agents(id),
  validationResult JSONB NOT NULL,
  confidence DECIMAL NOT NULL,
  consensusReached BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gossip_packets table
CREATE TABLE IF NOT EXISTS gossip_packets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fromAgentId UUID REFERENCES ai_agents(id),
  toAgentId UUID REFERENCES ai_agents(id),
  messageType TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(agentType);
CREATE INDEX IF NOT EXISTS idx_ai_agents_reputation ON ai_agents(reputation DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_events_agent ON reputation_events(agentId);
CREATE INDEX IF NOT EXISTS idx_reputation_events_user ON reputation_events(userId);
CREATE INDEX IF NOT EXISTS idx_agent_validations_session ON agent_validations(sessionId);
CREATE INDEX IF NOT EXISTS idx_gossip_packets_processed ON gossip_packets(processed);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gossip_packets ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can do everything on ai_agents" ON ai_agents
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on reputation_events" ON reputation_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on agent_validations" ON agent_validations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on gossip_packets" ON gossip_packets
  FOR ALL USING (auth.role() = 'service_role');

-- Insert initial AI agents
INSERT INTO ai_agents (agentType, name, description) VALUES
('code-review', 'Code Review Agent', 'Analyzes code quality and best practices'),
('documentation', 'Documentation Agent', 'Generates comprehensive documentation'),
('test-generation', 'Test Generation Agent', 'Creates comprehensive test cases'),
('performance', 'Performance Agent', 'Analyzes performance bottlenecks'),
('security', 'Security Agent', 'Identifies security vulnerabilities'),
('llm-judge', 'LLM Judge Agent', 'Provides overall code assessment')
ON CONFLICT (agentType) DO NOTHING;