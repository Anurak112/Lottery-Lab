# Lottery Lab Deployment Guide

**Version:** 1.0  
**Last Updated:** December 16, 2024  
**Author:** Manus AI

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Architecture](#project-architecture)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
   - [Option A: PlanetScale (Recommended)](#option-a-planetscale-recommended)
   - [Option B: AWS RDS MySQL](#option-b-aws-rds-mysql)
   - [Option C: Railway MySQL](#option-c-railway-mysql)
6. [Deployment Options](#deployment-options)
   - [Vercel Deployment](#vercel-deployment)
   - [AWS Deployment](#aws-deployment)
   - [Railway Deployment](#railway-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## Overview

Lottery Lab is a full-stack web application built with React 19, Express.js, tRPC, and Drizzle ORM. The application provides real-time Thai lottery results, live streaming integration, and interactive chat features. This guide covers deployment to various cloud platforms with production-ready configurations.

### Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | React + Vite | 19.x / 7.x |
| Backend | Express.js + tRPC | 4.x / 11.x |
| Database | MySQL (via Drizzle ORM) | 8.x |
| Styling | Tailwind CSS | 4.x |
| State Management | Zustand + TanStack Query | 5.x |
| Authentication | OAuth (Manus) | - |
| Package Manager | pnpm | 10.x |

---

## Prerequisites

Before deploying, ensure you have the following installed and configured:

### Local Development Requirements

```bash
# Node.js 18+ (LTS recommended)
node --version  # Should be >= 18.0.0

# pnpm package manager
npm install -g pnpm
pnpm --version  # Should be >= 10.0.0

# Git
git --version
```

### Cloud Platform Accounts

You will need accounts on the following platforms depending on your deployment choice:

- **Vercel** - For serverless deployment (free tier available)
- **AWS** - For EC2/ECS deployment (requires billing setup)
- **PlanetScale** or **Railway** - For managed MySQL database

---

## Project Architecture

The project follows a monorepo structure with clear separation between client and server code:

```
lottery_stats/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── stores/         # Zustand state stores
│   │   └── index.css       # Global styles
│   └── index.html
├── server/                 # Backend Express + tRPC
│   ├── _core/              # Core server utilities
│   ├── routers.ts          # tRPC routers
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and constants
├── drizzle/                # Database schema and migrations
│   ├── schema.ts           # Table definitions
│   └── migrations/         # SQL migration files
├── package.json
├── vite.config.ts
└── drizzle.config.ts
```

### Build Output

After running `pnpm build`, the following artifacts are generated:

- `dist/client/` - Static frontend assets (HTML, CSS, JS)
- `dist/index.js` - Bundled server code

---

## Environment Variables

The application requires several environment variables for proper operation. Create a `.env` file in the project root with the following variables:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db?ssl={"rejectUnauthorized":true}` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-32-character-secret-key-here` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Variables (OAuth & Analytics)

| Variable | Description | Example |
|----------|-------------|---------|
| `OAUTH_SERVER_URL` | OAuth server endpoint | `https://oauth.example.com` |
| `VITE_APP_TITLE` | Application title | `Lottery Lab` |
| `VITE_APP_LOGO` | Logo URL | `https://example.com/logo.png` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics tracking ID | `abc123` |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint | `https://analytics.example.com` |

### S3 Storage Variables (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJal...` |
| `AWS_S3_BUCKET` | S3 bucket name | `lottery-lab-uploads` |
| `AWS_REGION` | AWS region | `ap-southeast-1` |

### Sample .env File

```env
# Database
DATABASE_URL="mysql://username:password@host:3306/lottery_lab?ssl={\"rejectUnauthorized\":true}"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"

# Environment
NODE_ENV="production"
PORT="3000"

# Application
VITE_APP_TITLE="Lottery Lab"
VITE_APP_LOGO="/logo.png"

# Optional: Analytics
VITE_ANALYTICS_WEBSITE_ID=""
VITE_ANALYTICS_ENDPOINT=""
```

---

## Database Setup

The application uses MySQL with Drizzle ORM. The database schema includes the following tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `sessions` | User session tracking |
| `chat_messages` | Live chat messages |
| `page_views` | Analytics page view tracking |
| `daily_stats` | Aggregated daily statistics |

### Option A: PlanetScale (Recommended)

PlanetScale offers a serverless MySQL-compatible database with a generous free tier, making it ideal for this project.

#### Step 1: Create Database

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database named `lottery_lab`
3. Select a region close to your deployment (e.g., `ap-southeast` for Asia)

#### Step 2: Get Connection String

1. Navigate to **Connect** → **Create password**
2. Select **Node.js** as the connection method
3. Copy the connection string:

```
mysql://username:password@aws.connect.psdb.cloud/lottery_lab?ssl={"rejectUnauthorized":true}
```

#### Step 3: Run Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-planetscale-connection-string"

# Generate and run migrations
pnpm db:push
```

### Option B: AWS RDS MySQL

For production workloads requiring more control, AWS RDS provides managed MySQL instances.

#### Step 1: Create RDS Instance

1. Open AWS Console → RDS → Create database
2. Choose **MySQL 8.0**
3. Select instance size (db.t3.micro for testing, db.t3.small+ for production)
4. Configure settings:
   - DB instance identifier: `lottery-lab-db`
   - Master username: `admin`
   - Master password: (generate secure password)

#### Step 2: Configure Security Group

1. Create a security group allowing inbound MySQL (port 3306)
2. For Vercel deployment, allow `0.0.0.0/0` (or use Vercel's IP ranges)
3. For EC2 deployment, restrict to your VPC CIDR

#### Step 3: Connection String Format

```
mysql://admin:password@lottery-lab-db.xxxxx.region.rds.amazonaws.com:3306/lottery_lab
```

### Option C: Railway MySQL

Railway provides simple database hosting with automatic backups.

#### Step 1: Create Database

1. Sign up at [railway.app](https://railway.app)
2. Create new project → Add MySQL
3. Copy the connection variables from the **Connect** tab

#### Step 2: Connection String

Railway provides individual variables. Combine them into a connection string:

```
mysql://user:password@host:port/railway
```

---

## Deployment Options

### Vercel Deployment

Vercel is the recommended platform for deploying this application due to its excellent support for Node.js backends and automatic SSL.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### Step 2: Create vercel.json

Create a `vercel.json` file in the project root:

```json
{
  "version": 2,
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": null,
  "functions": {
    "dist/index.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 30
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/index.js"
    },
    {
      "src": "/trpc/(.*)",
      "dest": "/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/client/$1"
    }
  ]
}
```

#### Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your MySQL connection string | Production |
| `JWT_SECRET` | Your JWT secret | Production |
| `NODE_ENV` | `production` | Production |

#### Step 4: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 5: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### AWS Deployment

For full control over infrastructure, deploy to AWS using EC2 or ECS.

#### Option 1: EC2 Deployment

##### Step 1: Launch EC2 Instance

1. Launch an Ubuntu 22.04 LTS instance (t3.small or larger)
2. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere

##### Step 2: Install Dependencies

```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2 for process management
npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

##### Step 3: Clone and Build

```bash
# Clone repository
git clone https://github.com/your-repo/lottery_stats.git
cd lottery_stats

# Install dependencies
pnpm install

# Create .env file
nano .env
# Add your environment variables

# Build application
pnpm build

# Run database migrations
pnpm db:push
```

##### Step 4: Configure PM2

```bash
# Start application with PM2
pm2 start dist/index.js --name lottery-lab

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
pm2 startup
```

##### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/lottery-lab`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lottery-lab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

##### Step 6: SSL with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

#### Option 2: AWS ECS with Fargate

For containerized deployment, create a Dockerfile:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and push to ECR:

```bash
# Build image
docker build -t lottery-lab .

# Tag and push to ECR
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com
docker tag lottery-lab:latest YOUR_ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/lottery-lab:latest
docker push YOUR_ACCOUNT.dkr.ecr.ap-southeast-1.amazonaws.com/lottery-lab:latest
```

### Railway Deployment

Railway offers the simplest deployment experience with automatic builds.

#### Step 1: Connect Repository

1. Sign in to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub repo
3. Select your repository

#### Step 2: Configure Build Settings

In project settings:

- **Build Command:** `pnpm build`
- **Start Command:** `pnpm start`
- **Root Directory:** `/`

#### Step 3: Add Environment Variables

Add all required environment variables in the Variables tab.

#### Step 4: Add MySQL Database

1. Click **+ New** → **Database** → **MySQL**
2. Railway automatically injects `DATABASE_URL`

---

## Post-Deployment Configuration

### Database Migrations

After deployment, ensure database migrations are applied:

```bash
# If using Vercel, run locally with production DATABASE_URL
DATABASE_URL="your-production-url" pnpm db:push

# Or use Vercel CLI
vercel env pull .env.production
source .env.production && pnpm db:push
```

### Health Check Endpoint

The application exposes a health check endpoint at `/api/health`. Configure your load balancer or monitoring service to poll this endpoint.

### Monitoring Setup

For production monitoring, consider integrating:

| Service | Purpose |
|---------|---------|
| Sentry | Error tracking |
| Datadog | APM and logs |
| UptimeRobot | Uptime monitoring |

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Symptom:** `ECONNREFUSED` or `Access denied` errors

**Solutions:**
1. Verify `DATABASE_URL` format is correct
2. Check SSL configuration (PlanetScale requires SSL)
3. Ensure database security group allows your IP/service

```bash
# Test connection
mysql -h host -u user -p database_name
```

#### Build Failures

**Symptom:** TypeScript or build errors

**Solutions:**
1. Ensure Node.js version matches (18+)
2. Clear node_modules and reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

#### Environment Variable Issues

**Symptom:** Features not working, undefined errors

**Solutions:**
1. Verify all required variables are set
2. Check variable names (case-sensitive)
3. For Vite variables, ensure `VITE_` prefix

### Logs Access

#### Vercel

```bash
vercel logs your-project-name
```

#### AWS EC2

```bash
pm2 logs lottery-lab
```

#### Railway

Access logs from the Railway dashboard → Deployments → Logs

---

## Security Best Practices

### Environment Variables

- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate JWT secrets periodically
- Use strong, randomly generated passwords

### Database Security

- Enable SSL for all database connections
- Use connection pooling to prevent exhaustion
- Implement rate limiting on API endpoints
- Regular backup schedule (automated with PlanetScale/RDS)

### Application Security

- Keep dependencies updated (`pnpm update`)
- Enable CORS only for trusted origins
- Implement request validation with Zod schemas
- Use HTTPS in production (automatic with Vercel/Railway)

### Recommended Security Headers

The application should set these headers (configure in Nginx or CDN):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm db:push` | Run database migrations |
| `pnpm test` | Run test suite |
| `pnpm check` | TypeScript type checking |

### Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [PlanetScale Documentation](https://docs.planetscale.com)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Railway Documentation](https://docs.railway.app)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

---

**Note:** This guide assumes familiarity with basic cloud deployment concepts. For production deployments, always test in a staging environment first and implement proper CI/CD pipelines for automated deployments.
