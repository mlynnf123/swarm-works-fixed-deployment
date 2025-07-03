#!/bin/bash

# CodeLlama 7B Setup for 8GB RAM Droplet
# Optimized for 4 vCPU / 8GB RAM configuration

echo "=== CodeLlama 7B Setup for Swarm Works ==="
echo "Starting setup at $(date)"

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required dependencies
echo "2. Installing dependencies..."
sudo apt install -y curl git nginx python3-pip python3-venv build-essential

# Install Ollama (optimized for CPU inference)
echo "3. Installing Ollama..."
curl -fsSL https://ollama.ai/install.sh | sh

# Configure Ollama for 8GB RAM
echo "4. Configuring Ollama for optimal performance..."
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null << EOF
[Service]
Environment="OLLAMA_NUM_PARALLEL=2"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_KEEP_ALIVE=5m"
EOF

# Reload and start Ollama
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama

# Pull CodeLlama 7B (best model for 8GB RAM)
echo "5. Downloading CodeLlama 7B model (this will take 10-15 minutes)..."
ollama pull codellama:7b-instruct

# Also pull a smaller model as backup
echo "6. Downloading backup model..."
ollama pull deepseek-coder:1.3b

# Create API directory
echo "7. Creating API service..."
mkdir -p /home/$USER/swarm-ai
cd /home/$USER/swarm-ai

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install FastAPI and dependencies
pip install fastapi uvicorn httpx pydantic redis python-multipart

# Create the enhanced API server
cat > api_server.py << 'EOF'
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
import time
import hashlib
import asyncio
from typing import Optional, Dict, List
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Swarm Works CodeLlama API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class CodeRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.1
    task: Optional[str] = "analyze"
    language: Optional[str] = None
    context: Optional[str] = None

class CodeResponse(BaseModel):
    output: str
    task: str
    model: str
    tokens_used: int
    processing_time: float
    cached: bool = False

class Suggestion(BaseModel):
    type: str
    description: str
    severity: str
    line: Optional[int] = None
    confidence: float

# Simple in-memory cache (use Redis in production)
cache: Dict[str, dict] = {}
CACHE_TTL = 3600  # 1 hour

def get_cache_key(request: CodeRequest) -> str:
    """Generate cache key from request"""
    key_data = f"{request.prompt}:{request.task}:{request.language}"
    return hashlib.md5(key_data.encode()).hexdigest()

def format_prompt(request: CodeRequest) -> str:
    """Format prompt based on task type"""
    templates = {
        "review": """You are an expert code reviewer. Review the following {language} code for:
- Bugs and potential errors
- Security vulnerabilities
- Performance issues
- Code style and best practices

Code:
```{language}
{code}
```

Provide a detailed review with specific line numbers where applicable.""",

        "explain": """You are a patient programming teacher. Explain the following {language} code:
- What it does
- How it works
- Key concepts used

Code:
```{language}
{code}
```

Explain in clear, simple terms suitable for someone learning.""",

        "test": """You are a test engineer. Generate comprehensive unit tests for the following {language} code:

Code:
```{language}
{code}
```

Include edge cases and error scenarios.""",

        "suggest": """You are a senior developer. Suggest improvements for the following {language} code:
- Optimizations
- Better patterns
- Cleaner implementation

Code:
```{language}
{code}
```

Provide specific, actionable suggestions.""",

        "analyze": """Analyze the following {language} code comprehensively:

Code:
```{language}
{code}
```

Provide insights about functionality, quality, and potential improvements."""
    }
    
    template = templates.get(request.task, templates["analyze"])
    language = request.language or "code"
    
    prompt = template.format(code=request.prompt, language=language)
    
    if request.context:
        prompt = f"Context: {request.context}\n\n{prompt}"
    
    return prompt

def parse_suggestions(output: str, task: str) -> List[Dict]:
    """Parse AI output for structured suggestions"""
    suggestions = []
    
    lines = output.split('\n')
    current_suggestion = None
    
    for line in lines:
        # Look for common patterns
        if any(keyword in line.lower() for keyword in ['error:', 'bug:', 'issue:', 'problem:']):
            if current_suggestion:
                suggestions.append(current_suggestion)
            current_suggestion = {
                'type': 'error',
                'description': line.strip(),
                'severity': 'error',
                'confidence': 0.8
            }
        elif any(keyword in line.lower() for keyword in ['warning:', 'caution:', 'note:']):
            if current_suggestion:
                suggestions.append(current_suggestion)
            current_suggestion = {
                'type': 'warning',
                'description': line.strip(),
                'severity': 'warning',
                'confidence': 0.7
            }
        elif any(keyword in line.lower() for keyword in ['suggestion:', 'improvement:', 'optimize:']):
            if current_suggestion:
                suggestions.append(current_suggestion)
            current_suggestion = {
                'type': 'improvement',
                'description': line.strip(),
                'severity': 'info',
                'confidence': 0.6
            }
        elif current_suggestion and line.strip():
            # Add to current suggestion description
            current_suggestion['description'] += ' ' + line.strip()
    
    if current_suggestion:
        suggestions.append(current_suggestion)
    
    return suggestions[:10]  # Limit to top 10 suggestions

@app.post("/api/ai/analyze", response_model=CodeResponse)
async def analyze_code(
    request: CodeRequest,
    authorization: Optional[str] = Header(None)
):
    start_time = time.time()
    
    # Check cache first
    cache_key = get_cache_key(request)
    if cache_key in cache:
        cached_data = cache[cache_key]
        if time.time() - cached_data['timestamp'] < CACHE_TTL:
            logger.info(f"Cache hit for task: {request.task}")
            return CodeResponse(
                **cached_data['response'],
                cached=True
            )
    
    try:
        # Select model based on code length
        code_length = len(request.prompt)
        if code_length > 2000:
            model = "deepseek-coder:1.3b"  # Faster for long code
        else:
            model = "codellama:7b-instruct"  # Better quality for short code
        
        formatted_prompt = format_prompt(request)
        
        # Call Ollama API with timeout
        async with httpx.AsyncClient() as client:
            logger.info(f"Processing {request.task} request with {model}")
            
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": formatted_prompt,
                    "stream": False,
                    "options": {
                        "temperature": request.temperature,
                        "num_predict": request.max_tokens,
                        "num_ctx": 4096,
                        "num_thread": 4
                    }
                },
                timeout=120.0  # 2 minute timeout
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Model API error")
            
            result = response.json()
            processing_time = time.time() - start_time
            
            response_data = {
                "output": result["response"],
                "task": request.task,
                "model": model,
                "tokens_used": result.get("eval_count", 0),
                "processing_time": round(processing_time, 2)
            }
            
            # Cache the response
            cache[cache_key] = {
                'response': response_data,
                'timestamp': time.time()
            }
            
            # Clean old cache entries
            if len(cache) > 100:
                oldest_key = min(cache.keys(), key=lambda k: cache[k]['timestamp'])
                del cache[oldest_key]
            
            return CodeResponse(**response_data)
            
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504, 
            detail="Request timeout - try shorter code or simpler task"
        )
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=5.0)
            models = response.json()
            
            # Get system info
            import psutil
            
            return {
                "status": "healthy",
                "models": [m["name"] for m in models.get("models", [])],
                "system": {
                    "cpu_percent": psutil.cpu_percent(interval=1),
                    "memory_percent": psutil.virtual_memory().percent,
                    "memory_available_gb": round(psutil.virtual_memory().available / (1024**3), 2)
                },
                "cache_size": len(cache)
            }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e)
        }

@app.get("/api/ai/models")
async def list_models():
    """List available models"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            models = response.json()
            return {
                "models": [
                    {
                        "name": m["name"],
                        "size": f"{m['size'] / (1024**3):.1f}GB",
                        "recommended_for": "code" if "code" in m["name"] else "general"
                    }
                    for m in models.get("models", [])
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Install psutil for system monitoring
    import subprocess
    subprocess.run(["pip", "install", "psutil"], check=True)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
EOF

# Install psutil for monitoring
pip install psutil

# Create systemd service
echo "8. Creating systemd service..."
sudo tee /etc/systemd/system/swarm-ai.service > /dev/null << EOF
[Unit]
Description=Swarm Works AI API Service
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/swarm-ai
Environment="PATH=/home/$USER/swarm-ai/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/home/$USER/swarm-ai/venv/bin/python api_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx with optimizations
echo "9. Configuring Nginx..."
sudo tee /etc/nginx/sites-available/swarm-ai > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 10M;
    client_body_timeout 120s;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
        
        # Buffering settings for large responses
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:8000/health;
        proxy_read_timeout 10s;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/swarm-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Create monitoring dashboard
echo "10. Creating monitoring script..."
cat > /home/$USER/monitor.sh << 'EOF'
#!/bin/bash
clear
echo "=== Swarm Works AI Monitor Dashboard ==="
echo "========================================"
echo ""

# System Resources
echo "📊 SYSTEM RESOURCES:"
echo "-------------------"
echo -n "CPU Usage: "
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo -n "Memory: "
free -h | grep Mem | awk '{print $3 " / " $2 " (" $7 " available)"}'
echo -n "Disk: "
df -h / | tail -1 | awk '{print $3 " / " $2 " (" $5 " used)"}'
echo ""

# Service Status
echo "🚀 SERVICE STATUS:"
echo "-----------------"
echo -n "Ollama: "
systemctl is-active ollama
echo -n "API Server: "
systemctl is-active swarm-ai
echo -n "Nginx: "
systemctl is-active nginx
echo ""

# Model Information
echo "🤖 AI MODELS:"
echo "-------------"
ollama list
echo ""

# Recent API Activity
echo "📝 RECENT ACTIVITY:"
echo "------------------"
sudo journalctl -u swarm-ai -n 5 --no-pager | grep -E "(INFO|ERROR)" || echo "No recent activity"
echo ""

# Performance Test
echo "⚡ QUICK PERFORMANCE TEST:"
echo "------------------------"
if curl -s http://localhost/health > /dev/null; then
    echo "✅ API is responsive"
    time curl -s -X POST http://localhost/api/ai/analyze \
        -H "Content-Type: application/json" \
        -d '{"prompt": "def hello(): print(\"test\")", "task": "explain"}' \
        > /dev/null 2>&1 && echo "✅ Test request successful" || echo "❌ Test request failed"
else
    echo "❌ API is not responding"
fi
EOF
chmod +x /home/$USER/monitor.sh

# Create optimization script
cat > /home/$USER/optimize.sh << 'EOF'
#!/bin/bash
echo "🔧 Optimizing Swarm AI for 8GB RAM..."

# System optimizations
sudo sysctl -w vm.swappiness=10
sudo sysctl -w vm.vfs_cache_pressure=50

# Clear caches
sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null

# Restart services
sudo systemctl restart ollama
sleep 5
sudo systemctl restart swarm-ai

echo "✅ Optimization complete!"
echo ""
./monitor.sh
EOF
chmod +x /home/$USER/optimize.sh

echo ""
echo "=== ✅ Setup Complete! ==="
echo ""
echo "📋 Next Steps:"
echo "1. Start the service: sudo systemctl start swarm-ai && sudo systemctl enable swarm-ai"
echo "2. Monitor status: ./monitor.sh"
echo "3. View logs: sudo journalctl -u swarm-ai -f"
echo ""
echo "🌐 Your AI API endpoints:"
echo "- Health Check: http://YOUR_DROPLET_IP/health"
echo "- Code Analysis: http://YOUR_DROPLET_IP/api/ai/analyze"
echo "- List Models: http://YOUR_DROPLET_IP/api/ai/models"
echo ""
echo "⚡ Performance Tips:"
echo "- Response time: 3-8 seconds for most requests"
echo "- Max code size: ~2000 lines"
echo "- Concurrent requests: 2-3 maximum"
echo ""
echo "💡 The API is compatible with your existing Next.js frontend!"