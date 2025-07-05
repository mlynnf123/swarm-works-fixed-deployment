#!/bin/bash

# Lightweight AI Setup for CPU Droplet (2GB RAM)
# Using Ollama with smaller models that fit in memory

echo "=== Lightweight AI Setup for Swarm Works ==="
echo "Starting setup at $(date)"

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required dependencies
echo "2. Installing dependencies..."
sudo apt install -y curl git nginx python3-pip python3-venv

# Install Ollama (lightweight model runner)
echo "3. Installing Ollama..."
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
echo "4. Starting Ollama service..."
sudo systemctl enable ollama
sudo systemctl start ollama

# Pull lightweight code models
echo "5. Downloading lightweight models..."
# CodeGemma 2B - Smallest code-specific model
ollama pull codegemma:2b
# Alternative: Phi-2 (2.7B general purpose)
ollama pull phi

# Create API wrapper directory
echo "6. Creating API wrapper..."
mkdir -p /home/$USER/swarm-ai
cd /home/$USER/swarm-ai

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install FastAPI for API wrapper
pip install fastapi uvicorn httpx pydantic

# Create the API wrapper for Ollama
cat > api_server.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
from typing import Optional
import asyncio

app = FastAPI(title="Swarm Works Lightweight AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 1024
    temperature: Optional[float] = 0.1
    task: Optional[str] = "analyze"

class CodeResponse(BaseModel):
    output: str
    task: str
    model: str
    tokens_used: int

# Use CodeGemma for code tasks, Phi for explanations
def select_model(task: str) -> str:
    if task in ["review", "test", "suggest"]:
        return "codegemma:2b"
    else:
        return "phi"  # Better for explanations

def format_prompt(prompt: str, task: str) -> str:
    templates = {
        "review": "Review this code for bugs and improvements:\n\n{code}",
        "explain": "Explain what this code does in simple terms:\n\n{code}",
        "test": "Write unit tests for this code:\n\n{code}",
        "suggest": "Suggest optimizations for this code:\n\n{code}",
        "analyze": "Analyze this code:\n\n{code}"
    }
    
    template = templates.get(task, templates["analyze"])
    return template.format(code=prompt)

@app.post("/api/ai/analyze", response_model=CodeResponse)
async def analyze_code(request: CodeRequest):
    try:
        model = select_model(request.task)
        formatted_prompt = format_prompt(request.prompt, request.task)
        
        # Call Ollama API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model,
                    "prompt": formatted_prompt,
                    "stream": False,
                    "options": {
                        "temperature": request.temperature,
                        "num_predict": request.max_tokens
                    }
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Model API error")
            
            result = response.json()
            
            return CodeResponse(
                output=result["response"],
                task=request.task,
                model=model,
                tokens_used=result.get("eval_count", 0)
            )
            
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Request timeout - try shorter code")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags")
            models = response.json()
            return {
                "status": "healthy",
                "models": [m["name"] for m in models.get("models", [])],
                "memory_available": "2GB"
            }
    except:
        return {"status": "unhealthy", "error": "Ollama not responding"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create systemd service
echo "7. Creating systemd service..."
sudo tee /etc/systemd/system/swarm-ai.service > /dev/null << EOF
[Unit]
Description=Swarm Works AI API Service
After=network.target ollama.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/swarm-ai
Environment="PATH=/home/$USER/swarm-ai/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/swarm-ai/venv/bin/python api_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo "8. Configuring Nginx..."
sudo tee /etc/nginx/sites-available/swarm-ai > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/swarm-ai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Create monitoring script
echo "9. Creating monitoring script..."
cat > /home/$USER/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Swarm AI Monitor ==="
echo "Memory Usage:"
free -h
echo ""
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo ""
echo "Ollama Status:"
systemctl status ollama --no-pager | head -n 5
echo ""
echo "API Status:"
systemctl status swarm-ai --no-pager | head -n 5
echo ""
echo "Available Models:"
ollama list
EOF
chmod +x /home/$USER/monitor.sh

# Create resource optimization script
echo "10. Creating optimization script..."
cat > /home/$USER/optimize.sh << 'EOF'
#!/bin/bash
# Optimize system for low memory
echo "Optimizing system for 2GB RAM..."

# Reduce system swappiness
sudo sysctl vm.swappiness=10
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

# Clear system cache
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches

# Restart services to free memory
sudo systemctl restart ollama
sudo systemctl restart swarm-ai

echo "Optimization complete. Current memory:"
free -h
EOF
chmod +x /home/$USER/optimize.sh

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Start the API service: sudo systemctl start swarm-ai"
echo "2. Enable auto-start: sudo systemctl enable swarm-ai"
echo "3. Check status: ./monitor.sh"
echo "4. Optimize memory: ./optimize.sh"
echo ""
echo "Your AI API will be available at: http://YOUR_DROPLET_IP/api/ai/analyze"
echo ""
echo "⚠️  IMPORTANT: With 2GB RAM, you're limited to:"
echo "- Small models (2-3B parameters)"
echo "- One request at a time"
echo "- Shorter code snippets (< 1000 lines)"
echo ""
echo "For better performance, consider upgrading to a 4GB+ droplet"