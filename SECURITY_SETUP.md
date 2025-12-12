# Security Setup Guide

## ⚠️ IMPORTANT: Your API Keys Are Exposed!

Your `.env` files contain sensitive credentials that should NEVER be committed to git. Follow these steps immediately:

## 🔒 Step 1: Check If You've Already Pushed Secrets

If you've already pushed your code to GitHub/GitLab with the `.env` files:

1. **Rotate ALL your API keys immediately!**
   - Go to Supabase Dashboard → Settings → API
   - Click "Reset" on your API keys
   - Update your local `.env` files with new keys

2. **Remove secrets from git history** (if already committed):
   ```bash
   # Remove .env files from git tracking
   git rm --cached backend/.env
   git rm --cached Frontend/.env
   
   # Commit the removal
   git commit -m "Remove sensitive .env files from tracking"
   
   # Push the changes
   git push
   ```

## 🛡️ Step 2: Verify Protection

Check that your `.env` files are now ignored:

```bash
# This should NOT show .env files
git status
```

If you see `.env` files listed, they're not being ignored properly.

## 📝 Step 3: Setup for New Developers

When someone clones your repo, they should:

1. Copy the example files:
   ```bash
   cp backend/.env.example backend/.env
   cp Frontend/.env.example Frontend/.env
   ```

2. Fill in their own credentials in the `.env` files

3. Never commit the `.env` files

## ✅ What's Protected Now

The `.gitignore` files now protect:
- ✅ `backend/.env` - Backend API keys
- ✅ `Frontend/.env` - Frontend API keys
- ✅ All `.env.*` variations
- ✅ Python cache files
- ✅ Node modules
- ✅ Build artifacts

## 🚨 What to Do If Keys Are Leaked

If your keys were already pushed to a public repo:

1. **Immediately rotate all credentials:**
   - Supabase API keys
   - Flask SECRET_KEY
   - Any other API keys

2. **Check for unauthorized access:**
   - Review Supabase logs
   - Check for unexpected database changes
   - Monitor for unusual activity

3. **Consider using environment-specific keys:**
   - Development keys (limited permissions)
   - Production keys (full permissions, never in code)

## 🔐 Best Practices Going Forward

1. **Never commit secrets** - Use `.env` files
2. **Use example files** - Commit `.env.example` instead
3. **Rotate keys regularly** - Change credentials periodically
4. **Use different keys per environment** - Dev, staging, production
5. **Enable RLS in Supabase** - Row Level Security protects your data
6. **Monitor access logs** - Watch for suspicious activity

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Git Secrets Prevention](https://git-secret.io/)
- [Environment Variables Guide](https://12factor.net/config)
