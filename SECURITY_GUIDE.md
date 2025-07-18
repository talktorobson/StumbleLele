# 🔐 Security Guide for StumbleLele

## Environment Variables Best Practices

### 1. **Local Development**
- Create `.env` file based on `.env.example`
- **NEVER** commit `.env` to Git
- Keep `.env` in `.gitignore` (already configured)

### 2. **Production Deployment (Vercel)**

#### Setting Environment Variables in Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your StumbleLele project
3. Navigate to Settings → Environment Variables
4. Add each variable:
   ```
   VITE_GEMINI_API_KEY = your-new-gemini-key
   OPENAI_API_KEY = your-new-openai-key
   XAI_API_KEY = your-new-xai-key
   ANTHROPIC_API_KEY = your-new-anthropic-key
   DATABASE_URL = your-database-url
   VITE_SUPABASE_URL = your-supabase-url
   VITE_SUPABASE_ANON_KEY = your-supabase-anon-key
   ```
5. Select which environments to apply to (Production/Preview/Development)

### 3. **API Key Security Checklist**

- [ ] All API keys are in `.env` file locally
- [ ] `.env` is listed in `.gitignore`
- [ ] No API keys in source code
- [ ] All keys use environment variables
- [ ] Production keys set in Vercel Dashboard
- [ ] Different keys for development/production
- [ ] Regular key rotation schedule

### 4. **Code Security Patterns**

#### ❌ NEVER DO THIS:
```javascript
const API_KEY = "AIzaSyAq9No9j2bzG_bBMCPV-sJrSo6W-4uKB9Q"; // EXPOSED!
```

#### ✅ ALWAYS DO THIS:
```javascript
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Safe!
```

### 5. **Git Security Commands**

Check for sensitive data before committing:
```bash
# Check what will be committed
git status
git diff --staged

# Remove sensitive file from staging
git reset HEAD <file>

# Remove file from Git history (if accidentally committed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### 6. **Additional Security Measures**

1. **Use GitGuardian**: Already monitoring your repository
2. **Pre-commit Hooks**: Consider adding checks for sensitive data
3. **Environment Validation**: Add startup checks for required env vars
4. **API Key Restrictions**: 
   - Restrict API keys by domain/IP in provider dashboards
   - Set usage quotas and alerts
5. **Monitoring**: Watch for unusual API usage

### 7. **Emergency Response Plan**

If keys are exposed again:
1. **Immediately rotate** all affected keys
2. **Check API usage** logs for unauthorized access
3. **Update** all deployment environments
4. **Notify** team members if applicable
5. **Review** security practices

### 8. **Development Workflow**

1. Clone repository
2. Copy `.env.example` to `.env`
3. Add your API keys to `.env`
4. Never commit `.env`
5. Deploy with environment variables in Vercel

## Remember: Security is not a one-time task but an ongoing practice! 🛡️