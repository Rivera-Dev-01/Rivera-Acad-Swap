# ⚡ Quick Deployment Guide

## 🎯 Deploy in 15 Minutes

### Step 1: Backend (Render) - 5 minutes

1. **Go to Render.com**
   - Visit: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select your repository

3. **Configure**
   ```
   Name: acad-swap-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn api:app
   ```

4. **Add Environment Variables**
   ```
   SUPABASE_URL = (from Supabase dashboard)
   SUPABASE_KEY = (from Supabase dashboard)
   SECRET_KEY = (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
   FLASK_ENV = production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Copy your URL: `https://acad-swap-backend-xxxx.onrender.com`

---

### Step 2: Frontend (Vercel) - 5 minutes

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure**
   ```
   Framework Preset: Vite
   Root Directory: Frontend
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL = https://acad-swap-backend-xxxx.onrender.com
   VITE_SUPABASE_URL = (from Supabase dashboard)
   VITE_SUPABASE_ANON_KEY = (from Supabase dashboard)
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

---

### Step 3: Update CORS - 2 minutes

1. **Update backend/app/__init__.py**
   
   Replace this line:
   ```python
   CORS(app, resources={r"/*": {"origins": "*"}})
   ```
   
   With:
   ```python
   CORS(app, resources={r"/*": {"origins": [
       "https://your-app.vercel.app",
       "http://localhost:5173"  # Keep for local dev
   ]}})
   ```

2. **Commit and Push**
   ```bash
   git add .
   git commit -m "Update CORS for production"
   git push
   ```

3. **Auto-Deploy**
   - Render and Vercel will auto-deploy on push
   - Wait 2-3 minutes

---

### Step 4: Test Everything - 3 minutes

Visit your Vercel URL and test:
- [ ] Login/Register
- [ ] Create a listing
- [ ] Make an offer
- [ ] Send a message
- [ ] Check notifications
- [ ] Send friend request

---

## 🎉 You're Live!

Your app is now deployed and accessible worldwide!

**Frontend**: https://your-app.vercel.app
**Backend**: https://your-backend.onrender.com

---

## 📝 Important Notes

### Free Tier Limitations:
- **Render**: Backend sleeps after 15 min inactivity (first request takes 30-60s)
- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth

### To Upgrade:
- **Render Starter**: $7/month (no sleep)
- **Vercel Pro**: $20/month (better performance)
- **Supabase Pro**: $25/month (more storage)

---

## 🔧 Troubleshooting

### Backend not responding?
- Check Render logs
- Verify environment variables
- Wait 60 seconds (cold start)

### CORS errors?
- Update CORS in backend/app/__init__.py
- Add your Vercel domain
- Redeploy

### Build fails?
- Check build logs in dashboard
- Verify all dependencies in requirements.txt/package.json

---

## 🚀 Next Steps

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains
   - Add to Render: Settings → Custom Domain

2. **Analytics** (Optional)
   - Add Vercel Analytics
   - Add Google Analytics

3. **Monitoring** (Optional)
   - Set up Sentry for error tracking
   - Enable Render health checks

---

**Need Help?** Check DEPLOYMENT_GUIDE.md for detailed instructions.
