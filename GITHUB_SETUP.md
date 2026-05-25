# 🚀 GitHub Repository Setup Guide

This guide will help you upload FactCheck App to GitHub as a new repository with professional standards.

---

## ✅ Pre-Upload Checklist

- [x] Code is clean and well-organized
- [x] All dependencies are in `package.json`
- [x] `requirements.txt` is properly documented
- [x] Professional `README.md` created
- [x] `LICENSE` file added (MIT)
- [x] `CONTRIBUTING.md` guidelines created
- [x] `SECURITY.md` policy added
- [x] `.env` files excluded from Git
- [x] `.gitignore` properly configured
- [x] ESLint configured
- [x] Tests included
- [x] TypeScript strict mode enabled

---

## 📋 Step-by-Step Upload Instructions

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in repository details:
   - **Repository name**: `factcheck-app`
   - **Description**: "Professional PDF Fact-Checking Application — Extract and verify claims from documents using AI-powered analysis and live web search."
   - **Visibility**: Public (or Private if preferred)
   - **Initialize repository**: ❌ NO (we already have local code)

3. Click **Create repository**

### Step 2: Initialize Git & Configure Remote

```bash
cd /Users/moc/Desktop/factcheck-app

# Initialize git (if not already initialized)
git init

# Configure user (if not already done)
git config user.name "Paras Agarwal"
git config user.email "your-email@example.com"

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial commit - professional fact-check application"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/factcheck-app.git

# Verify remote
git remote -v
```

### Step 3: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

### Step 4: Configure GitHub Repository Settings

#### 1. **Branches Protection** (Optional but Recommended)
- Go to **Settings → Branches → Add rule**
- Branch name: `main`
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

#### 2. **Security & Analysis**
- Go to **Settings → Security → Code security and analysis**
- ✅ Enable **Dependabot alerts**
- ✅ Enable **Dependabot security updates**
- ✅ Enable **Secret scanning**

#### 3. **General Settings**
- Go to **Settings → General**
- Add topics: `fact-checking`, `pdf`, `react`, `cloudflare-workers`, `verification`
- Set default branch: `main`

#### 4. **About Section**
- Click **Edit** next to repository name
- Add description and link to live demo (if available)
- Select "Website" as category

### Step 5: Set Up GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

---

## 🔐 Security Checklist Before Pushing

### Verify No Sensitive Data:

```bash
# Check for API keys or secrets in recent commits
git log -p | grep -i "api_key\|secret\|password"

# Scan for common patterns
git log -p | grep -E "BEARER|Bearer|sk_|api_key"

# Check if .env is properly ignored
git check-ignore .env .env.production
```

### Expected Output:
```
.env
.env.production
```

### Remove .env If Accidentally Committed:

```bash
# ONLY if .env was committed before .gitignore was updated
git rm --cached .env
git rm --cached .env.production
git commit -m "chore: remove .env files from tracking"
git push
```

---

## 📦 Deployment Configuration

### For Cloudflare Workers Deployment:

1. **Install Wrangler CLI**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy Worker**:
   ```bash
   cd worker
   npm run deploy
   ```

4. **Deploy Pages**:
   ```bash
   npm run build
   wrangler pages deploy dist/
   ```

---

## 📝 GitHub Repository Files Summary

```
factcheck-app/
├── README.md           ✅ Professional documentation
├── LICENSE             ✅ MIT License
├── CONTRIBUTING.md     ✅ Contribution guidelines
├── SECURITY.md         ✅ Security policy
├── requirements.txt    ✅ System requirements
├── .gitignore          ✅ Updated with .env exclusion
├── .github/
│   └── workflows/
│       └── ci.yml      ✅ Optional CI/CD
└── [source code]
```

---

## 🔄 Syncing Changes After Upload

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/my-feature

# Create Pull Request on GitHub UI
```

---

## 📊 Repository Statistics

Once uploaded, GitHub will show:
- 📈 Commit history
- 👥 Contributors
- 📊 Network graph
- 📋 Issues & PRs tracker
- 📝 Discussion board

---

## 🆘 Troubleshooting

### Authentication Error
```bash
# Use GitHub CLI instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/factcheck-app.git

# Or use GitHub CLI
gh repo create factcheck-app --source=. --remote=origin --push
```

### Large Files Error
```bash
# Check file sizes
find . -type f -size +100M

# Remove large node_modules, dist/ (already in .gitignore)
git gc --aggressive
```

### Need to Amend Last Commit
```bash
git add .
git commit --amend --no-edit
git push --force-with-lease origin main
```

---

## ✨ Next Steps

1. ✅ Update repository `README.md` with link to live demo
2. ✅ Add badges (status, license, tests, etc.)
3. ✅ Create GitHub Projects for issue tracking
4. ✅ Set up automated deployments (GitHub Actions → Cloudflare)
5. ✅ Enable discussions for community
6. ✅ Create release tags for versions

---

## 📞 Helpful Links

- [GitHub Docs](https://docs.github.com/)
- [GitHub CLI](https://cli.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Your repository is ready for upload! 🎉**

For questions, refer to `CONTRIBUTING.md` or check GitHub's Help documentation.

---

**Last Updated**: May 2026
