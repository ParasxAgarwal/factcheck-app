# Contributing to FactCheck App

Thank you for your interest in contributing to FactCheck App! We welcome contributions from the community.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/factcheck-app.git
cd factcheck-app
```

### 2. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

Follow branch naming:
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation
- `test/` — Testing improvements

### 3. Make Changes

**Before coding:**
- Check existing issues and PRs
- Create an issue to discuss your idea

**While coding:**
- Follow the existing code style
- Add TypeScript types (no `any`)
- Include unit tests for new features
- Run tests: `npm test`
- Run linter: `npm run lint`

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add new feature description"
git push origin feature/your-feature-name
```

Use conventional commits:
- `feat:` — New features
- `fix:` — Bug fixes
- `docs:` — Documentation
- `style:` — Code style (no logic change)
- `refactor:` — Code refactoring
- `test:` — Adding/updating tests
- `chore:` — Maintenance tasks

### 5. Submit Pull Request

**PR checklist:**
- ✅ Tests pass: `npm test && npm run lint`
- ✅ Changes are documented
- ✅ No sensitive data in commits
- ✅ Branch is up-to-date with `main`

**In PR description:**
- Describe the change
- Reference related issues (#123)
- Show any relevant screenshots/logs

---

## Development Setup

### Prerequisites
- Node.js v20+
- npm v10+

### Installation
```bash
npm install
```

### Commands
```bash
npm run dev              # Start development servers
npm run dev:web         # Frontend only
npm run dev:worker      # Backend only
npm test                # Run tests
npm run lint            # Lint code
npm run build           # Build for production
```

---

## Areas for Contribution

- 🔍 **Search Providers**: Add new search engine integrations
- 🧠 **ML Models**: Improve claim extraction algorithms
- 🎨 **UI/UX**: Enhance the user interface
- 📚 **Documentation**: Improve guides and API docs
- 🐛 **Bug Fixes**: Fix reported issues
- ✅ **Tests**: Increase test coverage

---

## Reporting Issues

Found a bug? Please create an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

---

## Questions?

- 📖 Check [README.md](README.md)
- 💬 Open a Discussion
- 🐛 Search existing Issues

---

**Thank you for contributing to FactCheck App! 🙏**
