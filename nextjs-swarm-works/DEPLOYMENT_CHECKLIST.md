# Swarm Works GitLab CI/CD Deployment Checklist

## Pre-Deployment Steps

### 1. Configure GitLab CI/CD Variables

Go to your GitLab project → Settings → CI/CD → Variables and add the following:

#### Required Variables:
- [ ] `DO_DROPLET_IP` = `137.184.190.24`
- [ ] `DO_SSH_PRIVATE_KEY` = Your SSH private key for DigitalOcean access
- [ ] `DO_API_TOKEN` = Your DigitalOcean API token
- [ ] `NEXTAUTH_SECRET` = Generate with: `openssl rand -base64 32`
- [ ] `GITHUB_ID` = Your GitHub OAuth App ID
- [ ] `GITHUB_SECRET` = Your GitHub OAuth App Secret
- [ ] `DATABASE_URL` = Your PostgreSQL/Supabase database URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key
- [ ] `AI_SERVICE_API_KEY` = Generate a secure API key for AI service
- [ ] `ARCADE_AI_API_KEY` = Your Arcade AI API key (if using)
- [ ] `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.devnet.solana.com` (or mainnet)
- [ ] `NEXT_PUBLIC_MERCHANT_WALLET` = Your Solana wallet address

#### Optional Variables (for Vercel deployment):
- [ ] `VERCEL_TOKEN` = Your Vercel token
- [ ] `VERCEL_URL` = Your Vercel deployment URL

#### Optional Variables (for Stripe):
- [ ] `STRIPE_SECRET_KEY` = Your Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret

### 2. Prepare Your Code

Before pushing to GitLab, ensure all changes are committed:

```bash
# Add all new files
git add .

# Review changes
git status

# Commit with descriptive message
git commit -m "Deploy Swarm Works with multi-agent AI system and updated frontend"
```

### 3. Verify Environment Files

Ensure you have NOT committed any sensitive files:
- [ ] `.env.local` should be in `.gitignore`
- [ ] `.env.production` should be in `.gitignore`
- [ ] No API keys or secrets in committed files

## Deployment Steps

### 1. Push to GitLab

```bash
# Push to main branch (triggers deployment)
git push origin main

# Or push to develop branch (for staging)
git push origin develop
```

### 2. Monitor Pipeline

1. Go to GitLab → CI/CD → Pipelines
2. Click on the running pipeline
3. Monitor each stage:
   - Build AI Service
   - Build Frontend
   - Test Frontend
   - Deploy AI to DigitalOcean
   - Deploy Frontend (Vercel or DO App Platform)

### 3. Verify Deployment

After successful deployment, verify:

- [ ] AI Service: `http://137.184.190.24:8000/health`
- [ ] AI Agents: `http://137.184.190.24:8000/docs`
- [ ] Frontend: Check your Vercel URL or DO App URL

## Post-Deployment Verification

### 1. Test AI Agents

```bash
# Test health endpoint
curl http://137.184.190.24:8000/health

# Test code review agent
curl -X POST http://137.184.190.24:8000/agent/code-review \
  -H "Content-Type: application/json" \
  -d '{"code": "def hello(): print(\"Hello\")", "language": "python"}'
```

### 2. Test Frontend Features

- [ ] Login with GitHub OAuth
- [ ] Create a new project
- [ ] Test AI analysis features
- [ ] Test wallet connection (if applicable)
- [ ] Verify all API endpoints are working

### 3. Monitor Logs

```bash
# SSH into droplet
ssh root@137.184.190.24

# Check Docker logs
docker logs swarm-multi-agent

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Pipeline Failures

1. **Docker build fails**: Check Dockerfile syntax and requirements
2. **SSH connection fails**: Verify DO_SSH_PRIVATE_KEY is correctly set
3. **AI service won't start**: Check model downloads and memory availability
4. **Frontend build fails**: Run `npm ci` and `npm run build` locally first

### Service Issues

1. **AI not responding**: 
   ```bash
   docker restart swarm-multi-agent
   docker logs swarm-multi-agent
   ```

2. **Models not loading**:
   ```bash
   docker exec -it swarm-multi-agent ollama list
   docker exec -it swarm-multi-agent ollama pull codellama:7b-instruct
   ```

3. **Nginx issues**:
   ```bash
   nginx -t
   systemctl restart nginx
   ```

## Rollback Procedure

If deployment fails:

1. **Revert to previous Docker image**:
   ```bash
   docker stop swarm-multi-agent
   docker run -d --name swarm-multi-agent-prev \
     -p 8000:8000 -v ollama_models:/root/.ollama \
     $CI_REGISTRY_IMAGE/multi-agent-ai:previous-sha
   ```

2. **Revert frontend on Vercel**:
   - Go to Vercel Dashboard
   - Select your project
   - Go to Deployments
   - Promote previous deployment

## Success Indicators

- [ ] All pipeline stages passed
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Frontend loads without errors
- [ ] AI agents respond to requests
- [ ] Database connections work
- [ ] Authentication flows complete successfully

## Next Steps After Deployment

1. Set up monitoring (Grafana, New Relic, etc.)
2. Configure alerts for service downtime
3. Set up automated backups
4. Document API endpoints for team
5. Create user documentation