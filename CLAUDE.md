# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

**Swarm Works** is a hybrid marketplace platform combining elements of Fiverr and GitHub for decentralized developer collaboration. The project has a dual architecture:

1. **Next.js 14 Application** (`/nextjs-swarm-works/`) - Main full-stack application with App Router
2. **Standalone React Components** (`/src/`) - Marketplace-specific UI components

## Key Technologies

- **Framework**: Next.js 14.1.0 with App Router, TypeScript
- **Database**: PostgreSQL with Prisma ORM + Supabase integration
- **Authentication**: NextAuth.js with GitHub integration
- **Payments**: Solana Pay (SOL, USDC, SWARM tokens) + Stripe
- **AI**: Multi-agent AI system + Arcade AI for code analysis
- **Styling**: Tailwind CSS with custom minimalist black & white design system
- **UI Components**: Radix UI primitives with custom styling

## Common Development Commands

```bash
# Main development (run from /nextjs-swarm-works/)
npm run dev              # Start development server
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint linting
npm run type-check      # TypeScript checking

# Database operations
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema changes
npx prisma studio       # Open Prisma Studio

# Testing (no test framework currently configured)
# Consider adding jest or vitest for unit testing
```

## Directory Structure

### Next.js App (`/nextjs-swarm-works/src/`)
- `app/` - Next.js 14 App Router with API routes
- `components/` - Reusable UI components (Navigation, AI components, Dashboard)
- `lib/` - Utility libraries (database, auth, payments, AI services, reputation system)
- `types/` - TypeScript definitions (including ai-agents.ts)
- `hooks/` - Custom React hooks
- `middleware.ts` - Authentication middleware

### Standalone Components (`/src/`)
- `components/` - Marketplace UI components
- `pages/` - Marketplace pages
- `types/` - Shared type definitions

## Database Schema

Comprehensive Prisma schema with 20+ models including:
- User management (User, Account, Session) with extended fields for reputation
- Project system (Project, Proposal, Milestone)
- Communication (Message, Review)
- Payments (Solana Pay integration)
- AI integration (AiSession, AiFeedback, AgentValidation)
- Reputation system (ReputationEvent for users and AI agents)

## Authentication & Security

- NextAuth.js with GitHub provider
- Middleware protection for authenticated routes (`/nextjs-swarm-works/src/middleware.ts`)
- JWT-based sessions with database persistence
- Protected API routes under `/api/admin/`

## Payment Integration

- Solana Pay for crypto payments (SOL, USDC, SWARM tokens)
- Wallet adapters for multiple Solana wallets (Phantom, Solflare)
- Stripe integration for traditional payments
- BigNumber.js for precise financial calculations

## AI Integration

### Multi-Agent AI System
- **Deployment**: DigitalOcean droplet at `http://137.184.190.24:8000`
- **6 Specialized AI Agents**:
  1. **Code Review Agent** (`codellama:7b-instruct`) - Code quality, best practices, bug detection
  2. **Documentation Agent** (`codellama:7b-instruct`) - Generates comprehensive documentation
  3. **Test Generation Agent** (`mistral:7b-instruct`) - Creates unit tests and test scenarios
  4. **Performance Agent** (`mistral:7b-instruct`) - Performance optimization analysis
  5. **Security Agent** (`mistral:7b-instruct`) - Security vulnerability detection
  6. **LLM Judge Agent** (`mistral:7b-instruct`) - Overall code quality assessment

### API Endpoints
- Individual agents: `/agent/{agent-type}` (e.g., `/agent/code-review`)
- Orchestrator: `/orchestrator/analyze` - Run multiple agents in parallel
- Health check: `/health` - Check system status and available models

### Next.js Integration
- Service library: `/nextjs-swarm-works/src/lib/ai-agents-service.ts`
- Enhanced service: `/nextjs-swarm-works/src/lib/enhanced-ai-service.ts`
- API routes: `/nextjs-swarm-works/src/app/api/ai/agents/`
- UI components: `/nextjs-swarm-works/src/components/ai/AgentOrchestrator.tsx`
- TypeScript types: `/nextjs-swarm-works/src/types/ai-agents.ts`

### Legacy Support
- Arcade AI service still available for compatibility
- GitHub integration for repository analysis
- Custom AI analysis endpoints in `/api/ai/`

## Reputation System

Comprehensive reputation system tracking:
- User reputation points and events
- AI agent validation and scoring
- Autonomous agent-to-agent validation
- Gossip protocol for distributed validation
- Background jobs for reputation updates (`/src/lib/background-jobs.ts`)

## Design System

Minimalist black & white aesthetic with:
- SF Pro font family with light font weights
- Card-based layouts with subtle borders
- Uppercase headers with letter spacing
- Consistent spacing scale (8px, 16px, 24px)
- CSS variables for theming
- Custom UI components using class-variance-authority

## Environment Variables Required

```
DATABASE_URL=                    # PostgreSQL connection string
NEXTAUTH_SECRET=                 # NextAuth secret key (generate with: openssl rand -base64 32)
NEXTAUTH_URL=                    # NextAuth callback URL
GITHUB_ID=                       # GitHub OAuth app ID
GITHUB_SECRET=                   # GitHub OAuth app secret
NEXT_PUBLIC_SOLANA_RPC_URL=      # Solana RPC endpoint
ARCADE_AI_API_KEY=               # Arcade AI API key
NEXT_PUBLIC_AI_SERVICE_URL=      # Multi-agent AI service URL (default: http://137.184.190.24:8000)
SUPABASE_URL=                    # Supabase project URL
SUPABASE_ANON_KEY=              # Supabase anonymous key
STRIPE_SECRET_KEY=               # Stripe secret key for payments
STRIPE_WEBHOOK_SECRET=           # Stripe webhook secret
```

## Deployment

### Quick Deployment
```bash
cd nextjs-swarm-works/deployment
./quick-deploy.sh    # Simple deployment with Ollama and TinyLlama
```

### Full Multi-Agent Deployment
```bash
cd nextjs-swarm-works/deployment
./setup-multi-agent.sh    # Setup multi-agent system
./deploy-multi-agent.sh   # Deploy the system
```

### Docker Deployment
- Docker Compose configuration available for containerized deployment
- Includes CodeLlama, Nginx reverse proxy, and Grafana monitoring

## Development Notes

- The project supports both traditional web development and blockchain integration
- Always test Solana wallet connections in development
- AI analysis features require proper API key configuration
- Database migrations should be handled through Prisma
- The design system emphasizes clean, minimal aesthetics with careful typography
- When working with payments, ensure proper error handling for blockchain transactions
- The reputation system runs background jobs that need to be considered in production
- Multi-agent AI system uses different models for different agent types
- Agent validation happens autonomously between AI agents