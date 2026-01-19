# WeeCare CI/CD Plan

## 📋 Overview

This document outlines the CI/CD strategy for WeeCare, a child medical history tracker built with Astro, React, and Supabase. The pipeline will use **GitHub Actions** to automate linting, building, testing, and packaging for deployment.

---

## 🎯 Pipeline Goals

1. **Code Quality**: Automated linting to maintain code standards
2. **Build Verification**: Ensure the application builds successfully on all branches
3. **Test Coverage**: Run unit tests (Vitest) and E2E tests (Playwright)
4. **Release Artifacts**: Create deployable artifacts for tagged releases
5. **Deployment Ready**: Prepare Docker images for VPS deployment

---

## 🔄 Workflow Structure

### 1. **Main CI Pipeline** (`ci.yml`)
**Triggers**: Push to all branches, pull requests

**Jobs**:

#### Job 1: Lint
- **Purpose**: Check code quality and formatting
- **Steps**:
  - Checkout code
  - Setup Node.js (v20)
  - Install dependencies (`npm ci`)
  - Run linter (`npm run lint`)

#### Job 2: Build
- **Purpose**: Verify the application builds successfully
- **Depends on**: Lint (runs after lint passes)
- **Steps**:
  - Checkout code
  - Setup Node.js (v20)
  - Install dependencies
  - Run build (`npm run build`)
  - Upload build artifacts (for inspection/debugging)
- **Environment**: Uses mock Supabase values for CI

#### Job 3: Unit Tests
- **Purpose**: Run Vitest unit tests
- **Runs in parallel with**: Build (after Lint)
- **Steps**:
  - Checkout code
  - Setup Node.js (v20)
  - Install dependencies
  - Run tests (`npm test -- --run --coverage`)
  - Upload coverage to artifacts

#### Job 4: E2E Tests
- **Purpose**: Run Playwright end-to-end tests
- **Depends on**: Build
- **Steps**:
  - Checkout code
  - Setup Node.js (v20)
  - Install dependencies
  - Install Playwright browsers
  - Build the application
  - Run E2E tests (`npm run test:e2e`)
  - Upload test results and screenshots on failure
- **Environment**: Uses mocked Supabase backend

---

### 2. **Release Pipeline** (`release.yml`)
**Triggers**: Push to tags matching `v*.*.*` (e.g., `v1.0.0`)

**Jobs**:

#### Job 1: Build Artifacts
- **Purpose**: Create production-ready build artifacts
- **Steps**:
  - Checkout code
  - Setup Node.js (v20)
  - Install dependencies
  - Run linter and tests
  - Run production build
  - Create deployment archive (tar.gz with dist/, package files, README)
  - Create GitHub Release with artifacts and auto-generated release notes

#### Job 2: Build Docker Image
- **Purpose**: Build Docker image for containerized deployment
- **Depends on**: Build Artifacts
- **Steps**:
  - Checkout code
  - Setup Docker Buildx
  - Build Docker image (not pushed)
  - Save image as artifact for manual deployment
- **Note**: Image is built but NOT pushed to registry automatically

---

## 🐳 Deployment Strategy Recommendations

### **Option 1: Docker + VPS (Recommended)**

**Why Docker?**
- ✅ Consistent environment across development and production
- ✅ Easy rollback to previous versions
- ✅ Isolated dependencies
- ✅ Simple deployment with `docker pull` + `docker run`
- ✅ Works great with Astro SSR applications

**Docker Setup**:
```dockerfile
# Multi-stage build for optimized image size
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
```

**Deployment Process**:
1. GitHub Actions builds and pushes Docker image to GHCR on release tags
2. SSH into VPS
3. Pull latest image: `docker pull ghcr.io/yourusername/weecare:latest`
4. Stop old container: `docker stop weecare`
5. Start new container: `docker run -d --name weecare -p 4321:4321 --env-file .env ghcr.io/yourusername/weecare:latest`

**Automation Options**:
- Use `docker-compose` for easier management
- Consider Watchtower for automatic updates
- Or use a simple deployment script triggered manually

---

### **Option 2: Direct Node.js Deployment**

**Process**:
1. SSH into VPS
2. Pull latest code from GitHub
3. Run `npm ci && npm run build`
4. Restart Node.js process (using PM2 or systemd)

**Pros**: Simpler, no Docker overhead
**Cons**: Less isolation, harder to rollback, environment inconsistencies

---

### **Option 3: Keep Vercel (Easiest)**

Since you already have Vercel adapter configured:
- Vercel can auto-deploy from GitHub
- Zero-downtime deployments
- Built-in CDN and edge functions
- Free tier available

**Consideration**: If you prefer self-hosting for cost or control, Docker is the way to go.

---

## 🔧 Required Setup Steps

### 1. **ESLint Configuration**

The project uses modern ESLint flat config format (`eslint.config.js`) with:
- `@eslint/js` for base JavaScript rules
- `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` for TypeScript
- `eslint-plugin-astro` for Astro files
- `eslint-plugin-react` and `eslint-plugin-react-hooks` for React components

Scripts in `package.json`:
```json
"lint": "eslint . --ext .js,.jsx,.ts,.tsx,.astro",
"lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx,.astro --fix"
```

---

### 2. **GitHub Secrets Configuration**

The current workflows use `GITHUB_TOKEN` (automatically provided) for:
- Creating GitHub Releases
- Pushing to GitHub Container Registry (GHCR)

**Optional Secrets** (only if needed):
- `SUPABASE_URL_TEST`: Test Supabase instance URL (currently using mock values)
- `SUPABASE_ANON_KEY_TEST`: Test Supabase anon key (currently using mock values)

**For VPS Deployment** (if automating in the future):
- `VPS_HOST`: Your VPS IP/hostname
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: Private SSH key for authentication

**Note**: The workflows currently use mock Supabase values for CI, so no real credentials are needed.

---

### 3. **Environment Variables Strategy**

**Development**: `.env` file (gitignored)
**CI/CD**: GitHub Secrets
**Production**: 
- Docker: `--env-file` or environment variables in docker-compose
- VPS: `.env` file on server or systemd environment file

---

## 📦 Artifact Outputs

### For All Branches:
- Build output (for debugging)
- Test coverage reports
- E2E test screenshots (on failure)

### For Release Tags:
- Docker image pushed to GHCR: `ghcr.io/yourusername/weecare:v1.0.0` and `:latest`
- Build artifacts attached to GitHub Release
- Automated release notes

---

## 🚀 Deployment Workflow (Manual VPS)

### Initial Setup:
1. Install Docker on VPS
2. Create `.env` file with production Supabase credentials
3. Configure reverse proxy (Nginx/Caddy) for HTTPS

### For Each Release:
```bash
# SSH into VPS
ssh user@your-vps

# Pull latest image
docker pull ghcr.io/yourusername/weecare:latest

# Stop and remove old container
docker stop weecare && docker rm weecare

# Start new container
docker run -d \
  --name weecare \
  --restart unless-stopped \
  -p 4321:4321 \
  --env-file /path/to/.env \
  ghcr.io/yourusername/weecare:latest

# Check logs
docker logs -f weecare
```

**Optional**: Create a deployment script to automate these steps.

---

## 🎯 Approved Approach

**Deployment Strategy**: **Dual Artifacts (Docker + Direct Deployment)**

**Decisions**:
1. ✅ **Docker images**: For containerized VPS deployment
2. ✅ **Build artifacts**: For direct Node.js deployment on VPS
3. ✅ **Manual deployment**: You'll deploy to VPS manually
4. ✅ **GHCR with manual triggers**: Docker images pushed only on manual workflow dispatch
5. ✅ **Mocked E2E tests**: No real Supabase instance needed in CI
6. ✅ **ESLint Standard**: Using recommended ESLint config
7. ❌ **No Vercel**: Self-hosting only to avoid costs and maintain control

**Pipeline Summary**:
- **All branches**: Lint → Build → Unit Tests → E2E Tests (mocked)
- **Release tags** (`v*`): Create both Docker image and build artifacts
- **Manual trigger**: Push Docker image to GHCR when you're ready to deploy

---

## 🎯 Additional Workflows

### Manual Docker Push Workflow
A separate workflow (`.github/workflows/docker-push.yml`) allows manual pushing of Docker images to GHCR:
- **Trigger**: Manual workflow dispatch from GitHub Actions UI
- **Input**: Docker image tag (e.g., `v1.0.0` or `latest`)
- **Purpose**: Push Docker images to GHCR only when ready to deploy
- **Authentication**: Uses `GITHUB_TOKEN` (no additional secrets needed)

### Usage
1. Go to Actions tab in GitHub
2. Select "Push Docker Image to GHCR" workflow
3. Click "Run workflow"
4. Enter the tag you want to push
5. Image will be available at `ghcr.io/<username>/weecare:<tag>`
