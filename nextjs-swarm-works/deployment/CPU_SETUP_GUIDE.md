# 🚀 Lightweight AI Setup for 2GB CPU Droplet

## Your Current Setup
- **Droplet:** ubuntu-s-2vcpu-2gb-amd-sfo3-01
- **Specs:** 2 vCPUs, 2GB RAM, 60GB Disk
- **Limitation:** No GPU, limited RAM

## Recommended Approach: Ollama with Small Models

### Option 1: Use This Droplet (Limited but Functional)

1. **SSH into your droplet:**
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. **Download and run the CPU setup script:**
   ```bash
   wget https://raw.githubusercontent.com/your-repo/deployment/setup-cpu-ai.sh
   chmod +x setup-cpu-ai.sh
   ./setup-cpu-ai.sh
   ```

3. **Start the service:**
   ```bash
   sudo systemctl start swarm-ai
   sudo systemctl enable swarm-ai
   ```

4. **Monitor performance:**
   ```bash
   ./monitor.sh
   ```

### What You Get:
- **CodeGemma 2B** - Google's smallest code model
- **Phi-2** - Microsoft's efficient 2.7B model
- **API compatible** with your existing code
- **~5-10 second** response times

### Limitations:
- ❌ Slower than GPU models
- ❌ Less accurate than larger models
- ❌ Limited to short code snippets
- ❌ One request at a time

---

## Option 2: Upgrade Droplet (Recommended)

### For Better Performance:

#### **CPU Option - 8GB RAM Droplet ($48/month)**
```bash
# Resize existing droplet
doctl compute droplet resize YOUR_DROPLET_ID --size s-4vcpu-8gb
```
- Can run CodeLlama 7B
- Better accuracy
- Handle larger code files

#### **GPU Option - GPU Droplet ($857/month)**
```bash
# Create new GPU droplet
doctl compute droplet create swarm-ai-gpu \
  --size gpu-h100-1x-80gb \
  --image ubuntu-22-04-x64 \
  --region nyc3
```
- Run full CodeLlama 13B
- Sub-second responses
- Production ready

---

## Option 3: Use External AI Services (Most Cost-Effective)

Instead of self-hosting, use:

### **1. Groq Cloud (Recommended)**
- **Free tier:** 30 requests/minute
- **Speed:** Fastest inference (300+ tokens/sec)
- **Models:** Llama-3, CodeLlama

Update your `ai-service.ts`:
```typescript
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
```

### **2. Together AI**
- **$0.20 per 1M tokens**
- **Models:** CodeLlama, Llama-3
- **No infrastructure needed**

### **3. Replicate**
- **Pay per second**
- **Cold starts** but very cheap
- **Good for low volume**

---

## Quick Decision Guide

### Use Your Current 2GB Droplet If:
- ✅ Just testing/development
- ✅ Low volume (<100 requests/day)
- ✅ Budget conscious
- ✅ OK with 5-10 second responses

### Upgrade to 8GB Droplet If:
- ✅ Need better accuracy
- ✅ Processing longer code
- ✅ Multiple concurrent users
- ✅ Budget: $48/month

### Use External API If:
- ✅ Want best performance
- ✅ No infrastructure management
- ✅ Pay only for usage
- ✅ Need to scale easily

---

## Immediate Next Steps for Your 2GB Droplet

1. **Run the lightweight setup:**
   ```bash
   ./setup-cpu-ai.sh
   ```

2. **Test the API:**
   ```bash
   curl http://localhost/health
   ```

3. **Update your `.env.local`:**
   ```env
   NEXT_PUBLIC_AI_SERVICE_URL=http://YOUR_DROPLET_IP
   ```

4. **Monitor memory usage:**
   ```bash
   free -h
   # If low on memory:
   ./optimize.sh
   ```

The setup will work with your existing Next.js code - just with smaller, faster models optimized for your droplet's constraints!