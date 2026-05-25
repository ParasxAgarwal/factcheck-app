# Fact-Check Application - Submission Document

## 📋 Project Overview

A professional fact-checking application that analyzes text from PDF documents, extracts claims, and verifies them against multiple search providers. Built with React, TypeScript, and deployed on Cloudflare infrastructure.

---

## 🚀 Deployed Application

**Live Demo**: https://d99b3c1e.cogculture-factcheck-web.pages.dev

**Features**:
- 📄 PDF upload with client-side text extraction
- 🔍 Intelligent claim extraction and segmentation
- ✅ Claim verification with multiple search providers
- 📊 Professional results display with claims, verdicts, and sources
- 🎨 Responsive, clean UI with GitHub integration

**How to Use**:
1. Visit the deployed link above
2. Upload a PDF file
3. Review extracted claims
4. View verification results with verdicts (True/False/Unclear)
5. Click sources to verify independently

---

## 📦 GitHub Repository

**Repository**: https://github.com/ParasxAgarwal/factcheck-app

**Contents**:
- ✅ **Clean, production-ready code** in TypeScript
- ✅ **Professional README.md** with complete documentation
- ✅ **requirements.txt** with all development and production commands
- ✅ **LICENSE** (MIT) for open-source distribution
- ✅ **CONTRIBUTING.md** with contribution guidelines
- ✅ **SECURITY.md** with security policies
- ✅ **.gitignore** excluding sensitive files and credentials

**Repository Structure**:
```
factcheck-app/
├── src/                           # React frontend (TypeScript)
│   ├── App.tsx                   # Main component
│   ├── App.css                   # Application styling
│   └── lib/                      # Utilities
├── worker/                        # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts              # Hono API server
│   │   └── lib/                  # Claim extraction & verification
│   └── wrangler.jsonc            # Worker configuration
├── README.md                      # Comprehensive documentation
├── requirements.txt               # Setup & deployment instructions
├── LICENSE                        # MIT License
├── CONTRIBUTING.md                # Contribution guidelines
├── SECURITY.md                    # Security policy
├── package.json                   # Frontend dependencies
└── vite.config.ts                # Build configuration
```

---

## 🎬 Demo Video

**Status**: To be recorded (30-second screen recording)

**What to Show**:
1. Visit deployed application
2. Upload a sample PDF
3. Show claim extraction
4. Display verification results
5. Demonstrate GitHub link in footer

---

## 🛠️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | React | 19.2.6 |
| **Language** | TypeScript | 6.0.2 |
| **Build Tool** | Vite | 8.0.12 |
| **Backend** | Cloudflare Workers + Hono | Latest |
| **PDF Processing** | pdfjs-dist | 4.10.38 |
| **Search Providers** | SearXNG, Brave Search, Firecrawl | APIs |
| **Deployment** | Cloudflare Pages (Frontend) + Cloudflare Workers (Backend) | - |

---

## 📲 API Endpoints

### POST /api/analyze
Analyzes a PDF document for claims and verifies them.

**Request**:
```json
{
  "pdf": "File",
  "extractedText": "string"
}
```

**Response**:
```json
{
  "id": "unique-id",
  "results": [
    {
      "claim": "string",
      "verdict": "True|False|Unclear",
      "source": "string",
      "searchProvider": "searxng|brave|firecrawl"
    }
  ],
  "warning": "string (if API not configured)"
}
```

---

## 🔐 Security Features

- ✅ Client-side PDF processing (no server uploads)
- ✅ Environment variables for API credentials
- ✅ Secrets excluded from version control
- ✅ Vulnerability scanning enabled
- ✅ Proper error handling and validation

---

## 🚀 Quick Start (For Reviewers)

### Prerequisites
```bash
Node.js v20+ and npm v10+
```

### Installation
```bash
git clone https://github.com/ParasxAgarwal/factcheck-app.git
cd factcheck-app
npm install
```

### Development
```bash
npm run dev              # Start frontend dev server
cd worker && npm run dev # Start worker in another terminal
```

### Production Build
```bash
npm run build            # Build frontend
cd worker && npm run build # Build worker
```

### Testing
```bash
npm test                 # Run tests
npm run lint             # Run ESLint
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
│  (React App @ Pages URL)                                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ POST /api/analyze
                     │
┌────────────────────▼────────────────────────────────────┐
│         Cloudflare Workers (Backend API)                │
│  (Hono Server @ cogculture-factcheck-api)               │
│                                                          │
│  ├─ Extract Claims (via LLM-like logic)                 │
│  └─ Verify via:                                         │
│     ├─ SearXNG (self-hosted)                            │
│     ├─ Brave Search API                                 │
│     └─ Firecrawl API                                    │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features Implemented

1. **PDF Upload & Processing**: Client-side text extraction using pdfjs-dist
2. **Claim Extraction**: Intelligent extraction of verifiable claims from text
3. **Multi-Source Verification**: Fallback chain through multiple search providers
4. **Professional UI**: Clean, responsive interface with GitHub integration
5. **Proper Documentation**: README, LICENSE, CONTRIBUTING, SECURITY guidelines
6. **Production Deployment**: Cloudflare Pages (frontend) + Workers (backend)
7. **Code Quality**: TypeScript strict mode, ESLint configuration, test files

---

## 📝 Credits

**Author**: [@PARASAGARWAL](https://github.com/ParasxAgarwal)

**License**: MIT (see [LICENSE](https://github.com/ParasxAgarwal/factcheck-app/blob/main/LICENSE))

---

## 📞 Contact & Support

- **GitHub**: https://github.com/ParasxAgarwal
- **Repository Issues**: https://github.com/ParasxAgarwal/factcheck-app/issues
- **Contributing**: See [CONTRIBUTING.md](https://github.com/ParasxAgarwal/factcheck-app/blob/main/CONTRIBUTING.md)

---

**Submission Date**: May 26, 2026  
**Application Status**: ✅ Production Ready  
**Last Deployment**: Latest (commit: 383ac12)
