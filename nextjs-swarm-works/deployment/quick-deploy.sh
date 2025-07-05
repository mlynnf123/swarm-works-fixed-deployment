#!/bin/bash
# Quick Deploy Script for Swarm Works AI
# Copy and paste this entire script into your DigitalOcean console

echo "=== Swarm Works AI Quick Deploy ==="

# 1. Update system
apt update && apt upgrade -y

# 2. Install Docker (easier than manual setup)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Run Ollama container
docker run -d \
  --name ollama \
  -p 11434:11434 \
  --restart unless-stopped \
  ollama/ollama

# 4. Pull lightweight model
docker exec ollama ollama pull tinyllama

# 5. Install Python and dependencies
apt install -y python3-pip nginx

# 6. Create simple API
mkdir -p /root/api
cd /root/api

cat > app.py << 'EOF'
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy"}).encode())
    
    def do_POST(self):
        if self.path == '/api/ai/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            # Simple analysis using ollama
            code = data.get('code', '')[:500]  # Limit code length
            prompt = f"Analyze this code: {code}"
            
            try:
                result = subprocess.run(
                    ['docker', 'exec', 'ollama', 'ollama', 'run', 'tinyllama', prompt],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"analysis": result.stdout}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8000), Handler)
    print('Starting server on port 8000...')
    server.serve_forever()
EOF

# 7. Create systemd service
cat > /etc/systemd/system/api.service << 'EOF'
[Unit]
Description=Swarm API
After=docker.service

[Service]
Type=simple
ExecStart=/usr/bin/python3 /root/api/app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable api
systemctl start api

# 8. Configure Nginx
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    location /health {
        proxy_pass http://localhost:8000;
    }

    location /api/ai/ {
        proxy_pass http://localhost:8000;
        proxy_read_timeout 300s;
    }
}
EOF

systemctl restart nginx

# 9. Test
sleep 5
curl http://localhost/health

echo ""
echo "=== Deployment Complete! ==="
echo "AI API: http://137.184.190.24/api/ai/analyze"
echo "Health: http://137.184.190.24/health"