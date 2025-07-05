#!/bin/bash
# Multi-Agent AI Setup for Swarm Works
# Deploys 5 specialized AI agents on DigitalOcean

echo "=== Swarm Works Multi-Agent AI Setup ==="
echo "Deploying 5 specialized AI agents..."

# 1. System preparation
echo "1. Preparing system..."
apt update && apt upgrade -y
apt install -y curl git python3 python3-pip nginx docker.io
systemctl start docker
systemctl enable docker

# 2. Install Ollama if not already installed
if ! command -v ollama &> /dev/null; then
    echo "2. Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    systemctl enable ollama
    systemctl start ollama
else
    echo "2. Ollama already installed"
fi

# 3. Pull required models
echo "3. Downloading AI models..."
echo "   This may take some time depending on your connection..."

# CodeLlama for code-specific tasks
ollama pull codellama:7b-instruct
ollama pull codellama:7b-code

# TinyLlama for lightweight tasks
ollama pull tinyllama:latest

# Phi-2 as an alternative lightweight model
ollama pull phi:latest

# 4. Create multi-agent API service
echo "4. Creating multi-agent API service..."
mkdir -p /root/swarm-ai-agents
cd /root/swarm-ai-agents

# Install Python dependencies
pip3 install fastapi uvicorn httpx pydantic asyncio aiohttp

# Create the multi-agent API server
cat > multi_agent_server.py << 'PYTHON'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import httpx
import asyncio
import json
import time
from enum import Enum

app = FastAPI(title="Swarm Works Multi-Agent AI Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentType(str, Enum):
    CODE_REVIEW = "code-review"
    DOCUMENTATION = "documentation"
    TEST_GENERATION = "test-generation"
    PERFORMANCE = "performance"
    SECURITY = "security"

class AgentRequest(BaseModel):
    code: str
    language: Optional[str] = "javascript"
    context: Optional[str] = None
    options: Optional[Dict[str, Any]] = {}

class AgentResponse(BaseModel):
    agentType: str
    result: str
    confidence: float
    suggestions: Optional[List[Dict[str, Any]]] = []
    metrics: Optional[Dict[str, Any]] = {}
    tokensUsed: int
    executionTime: float

# Agent configurations
AGENT_CONFIGS = {
    AgentType.CODE_REVIEW: {
        "model": "codellama:7b-instruct",
        "temperature": 0.3,
        "system_prompt": """You are an expert code reviewer. Analyze the provided code for:
- Code quality and readability
- Best practices and conventions
- Potential bugs or issues
- Performance considerations
- Maintainability

Provide specific, actionable feedback with examples."""
    },
    AgentType.DOCUMENTATION: {
        "model": "codellama:7b-instruct",
        "temperature": 0.5,
        "system_prompt": """You are a technical documentation expert. Generate clear, comprehensive documentation including:
- Function/method descriptions
- Parameter explanations
- Return value documentation
- Usage examples
- Edge cases and limitations"""
    },
    AgentType.TEST_GENERATION: {
        "model": "codellama:7b-code",
        "temperature": 0.2,
        "system_prompt": """You are a testing expert. Generate comprehensive test cases including:
- Unit tests covering all functions/methods
- Edge cases and error scenarios
- Mock data and fixtures
- Test descriptions"""
    },
    AgentType.PERFORMANCE: {
        "model": "tinyllama:latest",
        "temperature": 0.1,
        "system_prompt": """You are a performance optimization expert. Analyze for:
- Time complexity issues
- Memory usage problems
- Potential bottlenecks
- Optimization opportunities"""
    },
    AgentType.SECURITY: {
        "model": "codellama:7b-instruct",
        "temperature": 0.1,
        "system_prompt": """You are a security expert. Analyze for:
- Common vulnerabilities (OWASP Top 10)
- SQL injection risks
- XSS vulnerabilities
- Authentication/authorization issues
- Data exposure risks"""
    }
}

async def call_ollama(model: str, prompt: str, temperature: float = 0.3) -> Dict[str, Any]:
    """Call Ollama API with the specified model and prompt"""
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "temperature": temperature,
                    "stream": False
                }
            )
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents": list(AgentType),
        "models": ["codellama:7b-instruct", "codellama:7b-code", "tinyllama:latest"]
    }

@app.post("/api/ai/agents/{agent_type}", response_model=AgentResponse)
async def analyze_with_agent(agent_type: AgentType, request: AgentRequest):
    """Analyze code with a specific AI agent"""
    start_time = time.time()
    
    if agent_type not in AGENT_CONFIGS:
        raise HTTPException(status_code=404, detail=f"Agent {agent_type} not found")
    
    config = AGENT_CONFIGS[agent_type]
    
    # Build the prompt
    prompt = f"{config['system_prompt']}\n\n"
    if request.context:
        prompt += f"Context: {request.context}\n\n"
    prompt += f"Language: {request.language}\n"
    prompt += f"Code:\n```{request.language}\n{request.code}\n```"
    
    # Call Ollama
    result = await call_ollama(
        model=config["model"],
        prompt=prompt,
        temperature=config["temperature"]
    )
    
    # Parse and structure the response
    response_text = result.get("response", "")
    tokens_used = len(response_text.split())  # Rough estimate
    
    # Extract suggestions based on agent type
    suggestions = parse_suggestions(response_text, agent_type)
    
    execution_time = time.time() - start_time
    
    return AgentResponse(
        agentType=agent_type.value,
        result=response_text,
        confidence=calculate_confidence(response_text, agent_type),
        suggestions=suggestions,
        metrics={"model": config["model"], "temperature": config["temperature"]},
        tokensUsed=tokens_used,
        executionTime=execution_time
    )

@app.post("/api/ai/orchestrate")
async def orchestrate_agents(
    code: str,
    language: str = "javascript",
    agents: List[AgentType] = None,
    parallel: bool = True
):
    """Run multiple agents on the same code"""
    if agents is None:
        agents = list(AgentType)
    
    start_time = time.time()
    
    if parallel:
        # Run agents in parallel
        tasks = []
        for agent in agents:
            request = AgentRequest(code=code, language=language)
            task = analyze_with_agent(agent, request)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
    else:
        # Run agents sequentially
        results = []
        for agent in agents:
            request = AgentRequest(code=code, language=language)
            result = await analyze_with_agent(agent, request)
            results.append(result)
    
    # Process results
    agent_results = {}
    critical_issues = 0
    total_suggestions = 0
    
    for i, agent in enumerate(agents):
        if isinstance(results[i], Exception):
            agent_results[agent.value] = {"error": str(results[i])}
        else:
            agent_results[agent.value] = results[i].dict()
            # Count critical issues
            for suggestion in results[i].suggestions:
                if suggestion.get("severity") in ["error", "critical"]:
                    critical_issues += 1
                total_suggestions += 1
    
    execution_time = time.time() - start_time
    
    return {
        "results": agent_results,
        "summary": f"Analyzed by {len(agents)} agents",
        "overallScore": calculate_overall_score(agent_results),
        "criticalIssues": critical_issues,
        "suggestions": total_suggestions,
        "executionTime": execution_time
    }

def parse_suggestions(text: str, agent_type: AgentType) -> List[Dict[str, Any]]:
    """Parse suggestions from agent response"""
    suggestions = []
    
    # Simple pattern matching for common formats
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if any(keyword in line.lower() for keyword in ['error:', 'warning:', 'issue:', 'problem:', 'vulnerability:']):
            severity = 'error' if 'error' in line.lower() else 'warning'
            if 'vulnerability' in line.lower() or 'security' in line.lower():
                severity = 'critical'
            
            suggestions.append({
                "type": agent_type.value,
                "description": line.strip(),
                "severity": severity,
                "line": i + 1
            })
    
    return suggestions[:10]  # Limit to 10 suggestions

def calculate_confidence(text: str, agent_type: AgentType) -> float:
    """Calculate confidence score based on response quality"""
    if not text:
        return 0.0
    
    # Factors that increase confidence
    factors = {
        "length": min(len(text) / 1000, 0.3),  # Longer responses
        "structure": 0.2 if any(marker in text for marker in ['1.', '2.', '-', '*']) else 0,
        "code_blocks": 0.2 if '```' in text else 0,
        "specificity": 0.2 if any(word in text.lower() for word in ['specifically', 'exactly', 'precisely']) else 0,
        "baseline": 0.1
    }
    
    return min(sum(factors.values()), 1.0)

def calculate_overall_score(results: Dict[str, Any]) -> float:
    """Calculate overall code quality score"""
    scores = []
    for agent, result in results.items():
        if "error" not in result and "confidence" in result:
            # Weight different agents differently
            weight = 1.0
            if agent == AgentType.SECURITY.value:
                weight = 1.5  # Security is more important
            elif agent == AgentType.PERFORMANCE.value:
                weight = 0.8  # Performance is less critical
            
            scores.append(result["confidence"] * weight)
    
    return sum(scores) / len(scores) if scores else 0.0

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYTHON

# 5. Create systemd service
echo "5. Creating systemd service..."
cat > /etc/systemd/system/swarm-ai-agents.service << 'EOF'
[Unit]
Description=Swarm Works Multi-Agent AI Service
After=network.target ollama.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/swarm-ai-agents
ExecStart=/usr/bin/python3 -m uvicorn multi_agent_server:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Configure Nginx for multi-agent routing
echo "6. Configuring Nginx..."
cat > /etc/nginx/sites-available/swarm-ai-agents << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Individual agent endpoints
    location ~ ^/api/ai/agents/(code-review|documentation|test-generation|performance|security)$ {
        proxy_pass http://localhost:8000$request_uri;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Orchestration endpoint
    location /api/ai/orchestrate {
        proxy_pass http://localhost:8000/api/ai/orchestrate;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
    }

    # Legacy single analyze endpoint (backwards compatibility)
    location /api/ai/analyze {
        proxy_pass http://localhost:8000/api/ai/agents/code-review;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }
}
NGINX

# 7. Enable and start services
echo "7. Starting services..."
systemctl daemon-reload
systemctl stop api || true  # Stop old service if exists
systemctl disable api || true
systemctl enable swarm-ai-agents
systemctl start swarm-ai-agents

# Update nginx
rm -f /etc/nginx/sites-enabled/*
ln -sf /etc/nginx/sites-available/swarm-ai-agents /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 8. Create monitoring script
echo "8. Creating monitoring script..."
cat > /root/monitor-agents.sh << 'BASH'
#!/bin/bash
echo "=== Swarm AI Agents Status ==="
echo ""
echo "1. Services Status:"
systemctl status swarm-ai-agents --no-pager | grep Active
systemctl status ollama --no-pager | grep Active
systemctl status nginx --no-pager | grep Active
echo ""
echo "2. Available Models:"
ollama list
echo ""
echo "3. Agent Endpoints:"
curl -s http://localhost/health | python3 -m json.tool
echo ""
echo "4. Memory Usage:"
free -h
echo ""
echo "5. Recent Logs:"
journalctl -u swarm-ai-agents -n 10 --no-pager
BASH

chmod +x /root/monitor-agents.sh

# 9. Test the deployment
echo "9. Testing deployment..."
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost/health | python3 -m json.tool

# Test individual agents
echo ""
echo "Testing Code Review Agent..."
curl -X POST http://localhost/api/ai/agents/code-review \
  -H "Content-Type: application/json" \
  -d '{"code": "function test() { return 42; }", "language": "javascript"}' \
  -s | python3 -m json.tool | head -20

echo ""
echo "=== Multi-Agent Setup Complete! ==="
echo ""
echo "Available endpoints:"
echo "- Health: http://$(curl -s ifconfig.me)/health"
echo "- Code Review: http://$(curl -s ifconfig.me)/api/ai/agents/code-review"
echo "- Documentation: http://$(curl -s ifconfig.me)/api/ai/agents/documentation"
echo "- Test Generation: http://$(curl -s ifconfig.me)/api/ai/agents/test-generation"
echo "- Performance: http://$(curl -s ifconfig.me)/api/ai/agents/performance"
echo "- Security: http://$(curl -s ifconfig.me)/api/ai/agents/security"
echo "- Orchestrate: http://$(curl -s ifconfig.me)/api/ai/orchestrate"
echo ""
echo "Monitor agents: ./monitor-agents.sh"
echo "View logs: journalctl -u swarm-ai-agents -f"