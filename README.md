# FactCheck App

> **Professional PDF Fact-Checking Application** — Extract and verify claims from documents using AI-powered analysis and live web search.

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/node.js-v20+-brightgreen)

---

## 🎯 Overview

FactCheck App is a full-stack application that:
- **Accepts PDF uploads** with intelligent drag-and-drop interface
- **Extracts verifiable claims** (statistics, dates, financial & technical figures) using advanced NLP
- **Verifies claims** against live web sources via multiple search APIs
- **Provides verdicts** per claim:
  - ✅ **Verified** — Multiple reliable sources confirm the claim
  - ⚠️ **Inaccurate** — Outdated or conflicting evidence found
  - ❌ **False** — No credible evidence found

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Cloudflare Workers + Hono framework
- **Search Engines**: 
  - SearXNG (recommended - open source)
  - Brave Search API (commercial alternative)
  - Firecrawl API (web scraping fallback)
- **PDF Processing**: pdfjs-dist (client-side)

### Project Structure
```
factcheck-app/
├── src/                          # React frontend
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Styling
│   ├── lib/
│   │   ├── pdf.ts               # PDF extraction logic
│   │   ├── types.ts             # TypeScript interfaces
│   │   └── ...
│   ├── main.tsx
│   └── index.css
├── worker/                       # Cloudflare Worker backend
│   ├── src/
│   │   ├── index.ts             # Hono API server
│   │   └── lib/
│   │       ├── claim-extractor.ts
│   │       ├── verifier.ts
│   │       ├── brave.ts
│   │       ├── firecrawl.ts
│   │       └── searxng.ts
│   ├── wrangler.jsonc           # Cloudflare config
│   └── package.json
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v20+ ([Download](https://nodejs.org/))
- **npm** v10+ (comes with Node)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/factcheck-app.git
cd factcheck-app

# Install dependencies (root + worker)
npm install
```

### Development

#### Option 1: Run Everything
```bash
npm run dev
```
This starts both the frontend and worker concurrently:
- Frontend: http://localhost:5173
- Worker API: http://localhost:8787

#### Option 2: Run Separately
```bash
# Terminal 1 - Frontend
npm run dev:web

# Terminal 2 - Backend Worker
npm run dev:worker
```

---

## ⚙️ Configuration

### Frontend Environment

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

Set your API endpoint:
```env
VITE_API_BASE_URL=http://localhost:8787
```

### Backend Search Configuration

Edit `worker/wrangler.jsonc` to configure search provider:

#### Option A: SearXNG (Recommended - Open Source)
```jsonc
"vars": {
  "SEARXNG_URL": "https://your-searxng-instance.com"
}
```

#### Option B: Brave Search API
```jsonc
"vars": {
  "BRAVE_API_KEY": "your_brave_api_key"
}
```
[Get free tier at brave.com](https://api.search.brave.com/)

#### Option C: Firecrawl API
```jsonc
"vars": {
  "FIRECRAWL_API_KEY": "your_firecrawl_key"
}
```
[Get free tier at firecrawl.dev](https://www.firecrawl.dev/)

---

## 📦 Build & Test

### Build for Production
```bash
npm run build
```
Outputs:
- `dist/` — Built frontend (ready for Cloudflare Pages)
- `worker/dist/` — Built worker code

### Run Tests
```bash
npm test
```

Tests cover:
- Claim extraction accuracy
- Verdict scoring logic
- API integration

### Lint Code
```bash
npm run lint
```

---

## 🌐 Deployment

### Deploy Backend (Cloudflare Workers)

```bash
cd worker

# Authenticate with Cloudflare
wrangler login

# Deploy
npm run deploy
```

Note your Worker URL (e.g., `https://factcheck-api.your-account.workers.dev`)

### Deploy Frontend (Cloudflare Pages)

**Option 1: CLI**
```bash
npm run build
wrangler pages deploy dist/
```

**Option 2: GitHub Integration**
1. Push to GitHub
2. Connect repository to Cloudflare Pages
3. Set `VITE_API_BASE_URL` environment variable
4. Pages auto-deploys on push

---

## 🔒 Security

### Best Practices

✅ **Implemented:**
- Input validation on all form fields
- CORS headers properly configured
- Environment variables for sensitive data
- Client-side PDF processing (no uploads to servers)
- TypeScript for type safety

⚠️ **Configuration:**
- Rotate API keys regularly
- Use `.env` files (never commit `.env` to git)
- Enable Cloudflare DDoS protection
- Monitor worker logs for suspicious activity

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

---

## 📋 API Documentation

### POST `/api/analyze`

**Request:**
```
multipart/form-data
- pdf: File              # PDF document
- extractedText: string  # Pre-extracted text (optional)
```

**Response:**
```json
{
  "id": "uuid",
  "results": [
    {
      "claim": {
        "id": "unique_id",
        "text": "Global AI market reached $150B in 2023",
        "numbers": ["150"],
        "years": ["2023"]
      },
      "verdict": "verified",
      "confidence": 0.92,
      "evidence": [
        {
          "title": "Global AI Market Report 2023",
          "url": "https://example.com/ai-market",
          "snippet": "The global artificial intelligence market...",
          "matchedNumbers": ["150"]
        }
      ]
    }
  ],
  "warning": null
}
```

---

## 📊 Performance

- **PDF Processing**: ~2-5s (client-side)
- **Claim Extraction**: ~3-8s (depends on document length)
- **Verification**: ~2-3s per claim (parallel)
- **Total**: Typically 10-20s for average PDF

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Areas for contribution:**
- Additional search providers integration
- Improved claim extraction models
- UI/UX enhancements
- Documentation improvements
- Test coverage expansion

---

## 📜 License

MIT License — see [LICENSE](LICENSE) file for details.

---

## 👤 Author

**@PARASAGARWAL**

---

## 🙏 Acknowledgments

Built with:
- [Cloudflare Workers](https://workers.cloudflare.com/) — Serverless compute
- [Hono](https://hono.dev/) — Lightweight web framework
- [React](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Frontend tooling

---

## 📞 Support

- 📖 [Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/factcheck-app/issues)
- 💬 [Discussions](https://github.com/yourusername/factcheck-app/discussions)

---

**Last Updated**: May 2026 | **Status**: Production Ready ✨
