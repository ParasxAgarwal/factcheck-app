# Security Policy

## Reporting Security Vulnerabilities

**Do not open public issues for security vulnerabilities.**

If you discover a security issue, please email security concerns to the maintainer directly.

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

---

## Security Best Practices

### For Users

#### Deployment
- ✅ Use environment variables for all API keys
- ✅ Never commit `.env` files to Git
- ✅ Rotate API keys regularly
- ✅ Use HTTPS in production
- ✅ Enable Cloudflare's DDoS protection
- ✅ Monitor worker logs for unusual activity

#### Local Development
- ✅ Create local `.env` file (not tracked by Git)
- ✅ Use throwaway API keys for testing
- ✅ Don't share `.env` files

### For Developers

#### Code Security
```typescript
// ✅ DO: Validate and sanitize inputs
import { z } from 'zod';
const schema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().positive()
});

// ❌ DON'T: Use unsanitized user input
const unsafeQuery = userInput; // Dangerous
```

#### Dependencies
```bash
# Check for vulnerabilities
npm audit

# Update safely
npm update

# Audit regularly
npm audit --audit-level=moderate
```

#### Secrets Management
```
Environment Variables (Required):
- VITE_API_BASE_URL
- SEARXNG_URL (if using SearXNG)
- BRAVE_API_KEY (if using Brave)
- FIRECRAWL_API_KEY (if using Firecrawl)

These MUST be in .env and .env.production, never in code.
```

---

## Known Security Considerations

### 1. PDF Processing
- PDFs are processed **client-side** in the browser
- No files are stored on servers
- PDFs are never transmitted to analysis services

### 2. API Communication
- All API calls use HTTPS in production
- CORS headers are configured restrictively
- Request validation on all endpoints

### 3. Data Privacy
- No user data is permanently stored
- Analysis results are transient
- IP logs are standard Cloudflare defaults

---

## Dependency Auditing

### Regular Updates
```bash
# Check for outdated packages
npm outdated

# Update patch versions safely
npm update

# Update to latest major versions (review breaking changes)
npm install npm@latest -g
npm audit fix
```

### Key Dependencies to Monitor
- `react` — UI library
- `vite` — Build tool
- `typescript` — Type checker
- `pdfjs-dist` — PDF parsing
- `hono` — Backend framework

---

## Deployment Security Checklist

Before deploying to production:

- [ ] `.env` files are NOT in Git
- [ ] `.gitignore` includes `.env*`
- [ ] API keys are configured in Cloudflare dashboard
- [ ] CORS origins are restricted
- [ ] Rate limiting is enabled
- [ ] Request validation is active
- [ ] HTTPS/TLS is enforced
- [ ] Security headers are set
- [ ] Logs are monitored
- [ ] Backups are in place

---

## Security Headers

### Recommended Cloudflare Settings

```
Security → Page Rules:
- Cache Everything (optional)
- Disable Security (never)
- SSL: Full or Full (Strict)

Security → Overview:
- DDoS Protection: ✅ Enabled
- Bot Fight Mode: ✅ Enabled
- Rate Limiting: Configure appropriately
```

---

## Incident Response

If a security incident occurs:

1. **Assess** the impact immediately
2. **Contain** by disabling affected API keys
3. **Notify** users if data was exposed
4. **Fix** the underlying issue
5. **Document** the incident for review
6. **Monitor** for signs of exploitation

---

## Contact

For security concerns, contact the maintainer directly. Do not use public issue trackers.

---

**Last Updated**: May 2026
