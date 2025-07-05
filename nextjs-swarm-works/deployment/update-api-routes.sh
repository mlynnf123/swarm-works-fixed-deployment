#!/bin/bash

# Update all AI agent API routes to match the DigitalOcean server endpoints

echo "🔧 Updating AI Agent API routes..."

# Update individual agent routes
sed -i '' 's|/api/ai/agents/code-review|/agent/code-review|g' src/app/api/ai/agents/code-review/route.ts
sed -i '' 's|/api/ai/agents/documentation|/agent/documentation|g' src/app/api/ai/agents/documentation/route.ts
sed -i '' 's|/api/ai/agents/test-generation|/agent/test-generation|g' src/app/api/ai/agents/test-generation/route.ts
sed -i '' 's|/api/ai/agents/performance|/agent/performance|g' src/app/api/ai/agents/performance/route.ts
sed -i '' 's|/api/ai/agents/security|/agent/security|g' src/app/api/ai/agents/security/route.ts

# Update orchestrate route
sed -i '' 's|/api/ai/orchestrate|/orchestrator/analyze|g' src/app/api/ai/orchestrate/route.ts

echo "✅ API routes updated!"

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local with AI service URL..."
  echo "NEXT_PUBLIC_AI_SERVICE_URL=http://137.184.190.24:8000" >> .env.local
else
  echo "⚠️  .env.local already exists. Please add: NEXT_PUBLIC_AI_SERVICE_URL=http://137.184.190.24:8000"
fi

echo "🎉 Update complete!"