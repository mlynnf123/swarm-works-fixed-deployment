#!/bin/bash
# Test AI Setup

# 1. Check services
echo "=== Checking Services ==="
systemctl status api --no-pager
echo ""
systemctl status nginx --no-pager
echo ""
docker ps

# 2. Test health endpoint
echo -e "\n=== Testing Health Endpoint ==="
curl -v http://localhost/health

# 3. Test AI endpoint
echo -e "\n=== Testing AI Endpoint ==="
curl -X POST http://localhost/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "function hello() { return \"Hello World\"; }", "language": "javascript"}'

# 4. Check logs if needed
echo -e "\n=== API Logs ==="
journalctl -u api -n 20 --no-pager

# 5. External test
echo -e "\n=== External Access Test ==="
curl http://137.184.190.24/health