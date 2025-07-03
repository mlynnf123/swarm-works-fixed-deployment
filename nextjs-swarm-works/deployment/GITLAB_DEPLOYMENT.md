# 🚀 GitLab CI/CD Deployment Guide for Swarm Works

## Overview
This guide sets up automated deployment for your Swarm Works marketplace using GitLab CI/CD pipelines.

## 🔧 **Setup Requirements**

### **1. GitLab Variables (Required)**

Go to your GitLab project → Settings → CI/CD → Variables and add:

#### **DigitalOcean Variables:**
```bash
DO_DROPLET_IP=137.184.190.24
DO_SSH_PRIVATE_KEY=[Your SSH private key]
DO_API_TOKEN=[Your DigitalOcean API token]
```

#### **Environment Variables:**
```bash
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
GITHUB_ID=[Your GitHub OAuth App ID]
GITHUB_SECRET=[Your GitHub OAuth Secret]
ARCADE_API_KEY=[Your Arcade AI API Key]
NEXT_PUBLIC_SUPABASE_URL=https://xyeluaffhayqrtmvkcgz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Role Key]
DATABASE_URL=[Your Supabase Database URL]
AI_SERVICE_API_KEY=[Generate a secure API key]
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_MERCHANT_WALLET=[Your Solana wallet address]
```

#### **Deployment Variables:**
```bash
VERCEL_TOKEN=[Your Vercel token - optional]
VERCEL_URL=[Your Vercel deployment URL - optional]
```

### **2. SSH Key Setup**

#### **Generate SSH Key for GitLab:**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@swarmworks"
```

#### **Add Public Key to DigitalOcean:**
1. Copy public key: `cat ~/.ssh/id_rsa.pub`
2. Go to DigitalOcean → Account → Security → SSH Keys
3. Add the public key

#### **Add Private Key to GitLab:**
1. Copy private key: `cat ~/.ssh/id_rsa`
2. Add to GitLab Variables as `DO_SSH_PRIVATE_KEY`

### **3. DigitalOcean API Token**

1. Go to DigitalOcean → API → Personal Access Tokens
2. Generate new token with read/write access
3. Add to GitLab Variables as `DO_API_TOKEN`

## 🚀 **Deployment Pipeline**

The pipeline has 4 stages:

### **Stage 1: Build**
- Builds AI service Docker image
- Builds Next.js frontend

### **Stage 2: Test**
- Runs tests (if configured)

### **Stage 3: Deploy AI**
- Deploys CodeLlama service to your DigitalOcean droplet
- Sets up Nginx reverse proxy
- Configures auto-restart

### **Stage 4: Deploy Frontend**
- Deploys to Vercel (recommended)
- OR deploys to DigitalOcean App Platform

## 📋 **Quick Start Steps**

### **1. Add the CI/CD file to your GitLab repo:**
```bash
# The .gitlab-ci.yml file is already created
git add .gitlab-ci.yml
git commit -m "Add GitLab CI/CD pipeline"
git push
```

### **2. Configure GitLab Variables:**
- Go to your GitLab project
- Settings → CI/CD → Variables
- Add all the variables listed above

### **3. Fix Your Droplet (if needed):**
```bash
# SSH into your droplet (try the console in DigitalOcean dashboard)
# Or reset the droplet and let GitLab deploy everything fresh
```

### **4. Trigger Deployment:**
- Push to `main` branch
- Or manually trigger in GitLab CI/CD → Pipelines

## 🔍 **What the Pipeline Does**

### **AI Service Deployment:**
1. **Installs Docker** on your droplet
2. **Pulls CodeLlama 7B model**
3. **Runs optimized API service**
4. **Sets up Nginx reverse proxy**
5. **Configures auto-restart**

### **Frontend Deployment:**
1. **Builds Next.js app** with all your features
2. **Deploys to Vercel** (or DigitalOcean)
3. **Connects to AI service** automatically

## 🛠️ **Manual Backup Plan**

If GitLab deployment fails, you can still deploy manually:

### **Reset Your Droplet:**
```bash
# In DigitalOcean dashboard:
# 1. Power cycle your droplet
# 2. Try SSH again, or use the web console
```

### **Manual AI Setup:**
```bash
# Run these on your droplet
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
docker run -d --name swarm-ai -p 8000:8000 --restart unless-stopped \
  ollama/ollama:latest
```

## 🎯 **Expected Results**

After successful deployment:

- **AI Service**: `http://137.184.190.24/api/ai/analyze`
- **Health Check**: `http://137.184.190.24/health`
- **Frontend**: Your Vercel URL with full marketplace

## 🔧 **Troubleshooting**

### **Pipeline Fails:**
1. Check GitLab CI/CD → Pipelines for error logs
2. Verify all environment variables are set
3. Check SSH key configuration

### **Droplet Issues:**
1. Use DigitalOcean web console instead of SSH
2. Check if droplet is powered on
3. Reset droplet if needed

### **AI Service Issues:**
1. Check logs: `docker logs swarm-ai-service`
2. Restart container: `docker restart swarm-ai-service`
3. Check health: `curl http://localhost:8000/health`

## 🚀 **Next Steps**

1. **Push to GitLab** to trigger deployment
2. **Monitor pipeline** progress in GitLab
3. **Test AI service** once deployed
4. **Connect frontend** to AI backend

This setup gives you:
- ✅ **Automated deployments**
- ✅ **Zero-downtime updates**
- ✅ **Rollback capability**
- ✅ **Environment management**
- ✅ **Scalable architecture**