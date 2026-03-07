# Deploy to Dokploy

## Prerequisites

1. Dokploy instance running
2. GitHub repository with your code
3. Supabase project set up

## Deployment Steps

### 1. Create Application in Dokploy

1. Go to your Dokploy dashboard
2. Click "Create Application"
3. Choose "Docker Compose" as deployment type
4. Connect your GitHub repository

### 2. Configure Build Settings

- **Build Path**: `/` (root directory)
- **Docker Compose Path**: `docker-compose.yml`

### 3. Set Environment Variables

In Dokploy dashboard, add these environment variables:

```bash
NODE_ENV=production

# Required: Supabase credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required: JWT configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h

# Required: Admin credentials
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password

# Optional: CORS origins (comma-separated)
ALLOWED_ORIGINS=https://your-domain.com

# Optional: Telegram notifications
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 4. Configure Domains

1. **Frontend Domain**: 
   - Add your domain (e.g., `yourdomain.com`)
   - Port: `8888` (maps to frontend container port 80)

2. **Backend API** (optional, if you need direct API access):
   - Add subdomain (e.g., `api.yourdomain.com`)
   - Port: `3000`

### 5. Deploy

1. Click "Deploy" in Dokploy
2. Wait for build to complete
3. Check logs for any errors

## Architecture

```
┌─────────────────────────────────────┐
│         Dokploy Load Balancer       │
└─────────────────┬───────────────────┘
                  │
          ┌───────┴────────┐
          │                │
    ┌─────▼──────┐   ┌────▼─────┐
    │  Frontend  │   │  Backend │
    │  (nginx)   │   │  (node)  │
    │  Port: 80  │   │ Port:3000│
    └─────┬──────┘   └────┬─────┘
          │               │
          │  /api proxy   │
          └───────────────┘
                  │
          ┌───────▼────────┐
          │    Supabase    │
          │   (external)   │
          └────────────────┘
```

## Troubleshooting

### Build fails
- Check Dockerfile paths
- Verify all dependencies are in package.json
- Check build logs in Dokploy

### Frontend can't reach backend
- Verify nginx.conf proxy settings
- Check container networking
- Verify VITE_API_URL is set to `/api`

### Database connection fails
- Verify Supabase credentials
- Check ALLOWED_ORIGINS includes your domain
- Verify Supabase project is running

## Production Checklist

- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Change default admin credentials
- [ ] Configure ALLOWED_ORIGINS
- [ ] Enable HTTPS in Dokploy
- [ ] Set up regular backups in Supabase
- [ ] Configure rate limiting if needed
