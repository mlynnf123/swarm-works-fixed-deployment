#!/bin/bash

# Deploy Multi-Agent Server to DigitalOcean Droplet
# Run this from your local machine to upload the server file

DROPLET_IP="137.184.190.24"
SERVER_FILE="multi_agent_server.py"

echo "🚀 Deploying Multi-Agent Server to DigitalOcean..."

# Upload the server file
echo "📤 Uploading server file..."
scp deployment/multi_agent_server.py root@$DROPLET_IP:/root/swarm-ai-agents/

# SSH into droplet and set up the server
echo "🔧 Setting up server on droplet..."
ssh root@$DROPLET_IP << 'EOF'
cd /root/swarm-ai-agents

# Install ERNIE model if not already installed
echo "📥 Installing ERNIE model..."
ollama pull ernie-4.5-0.3b

# Make sure we have the required Python packages
pip install fastapi[all] httpx uvicorn

# Stop any existing service
systemctl stop swarm-ai-agents || true
pkill -f multi_agent_server.py || true

# Make the server file executable
chmod +x multi_agent_server.py

# Create systemd service file
cat > /etc/systemd/system/swarm-ai-agents.service << 'SERVICE_EOF'
[Unit]
Description=Swarm Works Multi-Agent AI Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/swarm-ai-agents
ExecStart=/usr/bin/python3 /root/swarm-ai-agents/multi_agent_server.py
Restart=always
RestartSec=3
Environment=PYTHONPATH=/root/swarm-ai-agents

[Install]
WantedBy=multi-user.target
SERVICE_EOF

# Reload systemd and start service
systemctl daemon-reload
systemctl enable swarm-ai-agents
systemctl start swarm-ai-agents

# Check service status
echo "✅ Service status:"
systemctl status swarm-ai-agents --no-pager

# Test the server
echo "🧪 Testing server endpoints..."
sleep 5
curl -s http://localhost:8000/ | python3 -m json.tool
curl -s http://localhost:8000/health | python3 -m json.tool

echo "🎉 Multi-Agent Server deployment complete!"
echo "Available endpoints:"
echo "  • GET  http://137.184.190.24:8000/"
echo "  • GET  http://137.184.190.24:8000/health"
echo "  • POST http://137.184.190.24:8000/agent/code-review"
echo "  • POST http://137.184.190.24:8000/agent/documentation"
echo "  • POST http://137.184.190.24:8000/agent/test-generation"
echo "  • POST http://137.184.190.24:8000/agent/performance"
echo "  • POST http://137.184.190.24:8000/agent/security"
echo "  • POST http://137.184.190.24:8000/agent/llm-judge"
echo "  • POST http://137.184.190.24:8000/orchestrator/analyze"
EOF

echo "🌟 Deployment script completed!"