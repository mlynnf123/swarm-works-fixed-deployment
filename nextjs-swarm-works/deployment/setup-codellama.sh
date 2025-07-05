#!/bin/bash

# CodeLlama Setup Script for DigitalOcean GPU Droplet
# This script sets up CodeLlama-13B-Instruct with vLLM for production use

echo "=== CodeLlama Setup for Swarm Works ==="
echo "Starting setup at $(date)"

# Update system
echo "1. Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required dependencies
echo "2. Installing dependencies..."
sudo apt install -y python3-pip python3-venv git curl wget

# Install Docker (for containerized deployment)
echo "3. Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
echo "4. Installing NVIDIA Container Toolkit..."
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt update && sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker

# Create app directory
echo "5. Creating application directory..."
mkdir -p /home/$USER/swarm-works-ai
cd /home/$USER/swarm-works-ai

# Create Python virtual environment
echo "6. Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate

# Install vLLM (optimized inference server)
echo "7. Installing vLLM..."
pip install vllm

# Create the API server script
echo "8. Creating API server..."
cat > server.py << 'EOF'
from vllm import LLM, SamplingParams
from vllm.entrypoints.api_server import app
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

# Initialize the model
print("Loading CodeLlama-13B-Instruct model...")
llm = LLM(
    model="codellama/CodeLlama-13b-Instruct-hf",
    trust_remote_code=True,
    download_dir="/models",
    gpu_memory_utilization=0.9,
    max_model_len=4096
)

# API request/response models
class CodeRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 2048
    temperature: Optional[float] = 0.1
    top_p: Optional[float] = 0.95
    task: Optional[str] = "analyze"  # analyze, review, explain, test, suggest

class CodeResponse(BaseModel):
    output: str
    task: str
    tokens_used: int

# FastAPI app
api = FastAPI(title="Swarm Works AI API")

@api.post("/api/ai/analyze", response_model=CodeResponse)
async def analyze_code(request: CodeRequest):
    try:
        # Format prompt based on task
        if request.task == "review":
            system_prompt = "You are an expert code reviewer. Analyze the following code for bugs, security issues, and improvements:"
        elif request.task == "explain":
            system_prompt = "You are a patient programming teacher. Explain the following code clearly:"
        elif request.task == "test":
            system_prompt = "You are a test engineer. Generate comprehensive tests for the following code:"
        elif request.task == "suggest":
            system_prompt = "You are a senior developer. Suggest improvements and optimizations for the following code:"
        else:
            system_prompt = "You are an expert software engineer. Analyze the following code:"
        
        full_prompt = f"<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{request.prompt} [/INST]"
        
        # Generate response
        sampling_params = SamplingParams(
            temperature=request.temperature,
            top_p=request.top_p,
            max_tokens=request.max_tokens
        )
        
        outputs = llm.generate([full_prompt], sampling_params)
        output_text = outputs[0].outputs[0].text
        
        return CodeResponse(
            output=output_text,
            task=request.task,
            tokens_used=len(outputs[0].outputs[0].token_ids)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/health")
async def health_check():
    return {"status": "healthy", "model": "CodeLlama-13B-Instruct"}

if __name__ == "__main__":
    uvicorn.run(api, host="0.0.0.0", port=8000)
EOF

# Create systemd service
echo "9. Creating systemd service..."
sudo tee /etc/systemd/system/codellama.service > /dev/null << EOF
[Unit]
Description=CodeLlama AI Service for Swarm Works
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER/swarm-works-ai
Environment="PATH=/home/$USER/swarm-works-ai/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/home/$USER/swarm-works-ai/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
echo "10. Setting up Nginx reverse proxy..."
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/codellama > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

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

sudo ln -s /etc/nginx/sites-available/codellama /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Create model download script
echo "11. Creating model download script..."
cat > download_model.py << 'EOF'
from huggingface_hub import snapshot_download
import os

print("Downloading CodeLlama-13B-Instruct model...")
model_path = snapshot_download(
    repo_id="codellama/CodeLlama-13b-Instruct-hf",
    cache_dir="/models",
    local_dir="/models/codellama-13b-instruct",
    token=os.getenv("HF_TOKEN")  # Optional: for gated models
)
print(f"Model downloaded to: {model_path}")
EOF

# Create monitoring script
echo "12. Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== CodeLlama Service Monitor ==="
echo "GPU Usage:"
nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv
echo ""
echo "Service Status:"
sudo systemctl status codellama --no-pager
echo ""
echo "Recent Logs:"
sudo journalctl -u codellama -n 20 --no-pager
EOF
chmod +x monitor.sh

echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "1. Download the model: python download_model.py"
echo "2. Start the service: sudo systemctl start codellama"
echo "3. Enable auto-start: sudo systemctl enable codellama"
echo "4. Check status: ./monitor.sh"
echo ""
echo "Your AI API will be available at: http://YOUR_DROPLET_IP/api/ai/analyze"
echo ""
echo "Remember to:"
echo "- Configure firewall: sudo ufw allow 80/tcp"
echo "- Set up SSL with Let's Encrypt for production"
echo "- Add authentication tokens for API security"