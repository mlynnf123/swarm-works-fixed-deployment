# 🚀 CodeLlama on DigitalOcean - Complete Setup Guide

## Prerequisites
- DigitalOcean account with GPU droplet access
- Domain name (optional but recommended)
- Basic Linux/SSH knowledge

## Step 1: Create GPU Droplet

1. **Login to DigitalOcean** → Create → Droplets → GPU Droplets

2. **Select Configuration:**
   ```
   GPU Type: GPU-H100-1x-80GB ($4.03/hour) OR RTX 4000 Ada ($1.19/hour)
   Image: Ubuntu 22.04 LTS (with GPU drivers)
   Size: Based on your budget
   Region: Closest to your users
   Authentication: SSH keys (recommended)
   ```

3. **Add initialization script** (optional):
   ```bash
   #!/bin/bash
   curl -sSL https://raw.githubusercontent.com/your-repo/setup-codellama.sh | bash
   ```

## Step 2: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 3: Run Setup Script

1. **Download and run the setup script:**
   ```bash
   wget https://raw.githubusercontent.com/your-repo/deployment/setup-codellama.sh
   chmod +x setup-codellama.sh
   ./setup-codellama.sh
   ```

2. **Download the CodeLlama model:**
   ```bash
   cd /home/ubuntu/swarm-works-ai
   source venv/bin/activate
   python download_model.py
   ```
   This will take 10-15 minutes to download ~26GB model files.

## Step 4: Configure Environment

1. **Create environment file:**
   ```bash
   nano /home/ubuntu/swarm-works-ai/.env
   ```

2. **Add configuration:**
   ```env
   # Model Configuration
   MODEL_NAME=codellama/CodeLlama-13b-Instruct-hf
   MODEL_PATH=/models/codellama-13b-instruct
   GPU_MEMORY_UTILIZATION=0.9
   MAX_MODEL_LEN=4096
   
   # API Configuration
   API_KEY=your-secure-api-key-here
   CORS_ORIGINS=https://your-swarm-works-domain.com
   
   # Optional: Hugging Face token for gated models
   HF_TOKEN=your-hf-token
   ```

## Step 5: Start the Service

```bash
# Start the AI service
sudo systemctl start codellama
sudo systemctl enable codellama

# Check status
sudo systemctl status codellama

# Monitor logs
sudo journalctl -u codellama -f
```

## Step 6: Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable
```

## Step 7: Set Up SSL (Production)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-ai-domain.com
```

## Step 8: Connect to Your Next.js App

1. **Update your `.env.local`:**
   ```env
   # AI Service Configuration
   NEXT_PUBLIC_AI_SERVICE_URL=https://your-ai-domain.com
   AI_SERVICE_API_KEY=your-secure-api-key-here
   ```

2. **Test the connection:**
   ```bash
   curl https://your-ai-domain.com/health
   ```

## Step 9: Update Your AI Page

Update `/src/app/ai/page.tsx` to use real AI service:

```typescript
// Replace mock call with:
const response = await fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: codeInput,
    language: detectLanguage(codeInput),
    task: activeTab, // 'review', 'explain', 'test', 'suggest'
    agentType: selectedAgent
  })
})
```

## Monitoring & Maintenance

### Check GPU Usage
```bash
nvidia-smi -l 1  # Updates every second
```

### Monitor Service
```bash
./monitor.sh
```

### View Logs
```bash
sudo journalctl -u codellama -f
```

### Restart Service
```bash
sudo systemctl restart codellama
```

## Cost Optimization

### For Development/Testing:
- Use RTX 4000 Ada ($1.19/hour)
- Turn off when not in use
- Use snapshots to quickly restore

### For Production:
- Use reserved instances (up to 50% savings)
- Implement caching for common queries
- Consider auto-scaling based on load

## Security Best Practices

1. **API Authentication:**
   - Always use API keys
   - Implement rate limiting
   - Use CORS restrictions

2. **Network Security:**
   - Use private networking between droplets
   - Implement fail2ban for SSH protection
   - Regular security updates

3. **Data Protection:**
   - Don't log sensitive code
   - Implement data retention policies
   - Use encrypted connections

## Troubleshooting

### Model won't load
```bash
# Check available memory
free -h
# Check GPU memory
nvidia-smi
```

### Service won't start
```bash
# Check logs
sudo journalctl -u codellama -n 100
# Check Python environment
which python
```

### Slow responses
- Reduce `max_model_len` in configuration
- Adjust `gpu_memory_utilization`
- Consider using smaller model (7B instead of 13B)

## Next Steps

1. **Test the integration** with your existing AI UI
2. **Implement caching** for common code patterns
3. **Add monitoring** with Grafana (included in docker-compose)
4. **Set up backups** for model weights and configurations
5. **Configure auto-scaling** for production loads

## Support Resources

- [CodeLlama Documentation](https://github.com/facebookresearch/codellama)
- [vLLM Documentation](https://docs.vllm.ai/)
- [DigitalOcean GPU Droplets](https://docs.digitalocean.com/products/droplets/gpu/)

Your AI service should now be running at `https://your-domain.com/api/ai/analyze`!