# 🚀 Deployment Guide - Acad Swap

## Overview
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render.com (Flask + Python)
- **Database**: Supabase (Already hosted)

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Backend (.env on Render)
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SECRET_KEY=your-secret-key
FLASK_ENV=production
```

#### Frontend (.env on Vercel)
```env
VITE_API_URL=https://your-backend-url.onrender.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🎯 Step-by-Step Deployment

### Part 1: Backend Deployment (Render.com)

#### Step 1: Prepare Backend Files
1. Create `render.yaml` (already created for you)
2. Update `requirements.txt` with gunicorn
3. Create `build.sh` script

#### Step 2: Deploy to Render
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `acad-swap-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn api:app`
   - **Instance Type**: Free

6. Add Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SECRET_KEY`
   - `FLASK_ENV=production`

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL: `https://acad-swap-backend.onrender.com`

---

### Part 2: Frontend Deployment (Vercel)

#### Step 1: Update API URLs
1. Create `.env.production` in Frontend folder
2. Add your Render backend URL

#### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. Your app is live! 🎉

---

## 🔧 Configuration Files Created

### 1. `backend/render.yaml`
Render deployment configuration

### 2. `Frontend/.env.production`
Production environment variables

### 3. `Frontend/src/config/api.ts`
Centralized API URL configuration

### 4. `backend/requirements.txt` (updated)
Added gunicorn for production

---

## 🔄 Update Process

### After Deployment:

1. **Update Frontend API URLs**
   - Replace all `http://localhost:5000` with environment variable
   - Use the new `api.ts` config file

2. **Update CORS Settings**
   - Add your Vercel domain to Flask CORS

3. **Test Everything**
   - Login/Register
   - Create listings
   - Make offers
   - Send messages
   - Notifications
   - Friend requests

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update `backend/api.py` CORS settings:
```python
CORS(app, origins=[
    "https://your-app.vercel.app",
    "http://localhost:5173"  # Keep for local dev
])
```

### Issue 2: API Not Found (404)
**Solution**: Check environment variables in Vercel dashboard

### Issue 3: Backend Cold Start
**Solution**: Render free tier sleeps after 15 min inactivity. First request takes 30-60 seconds.

### Issue 4: Build Fails
**Solution**: Check build logs in Vercel/Render dashboard

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)
- **Vercel**: Free (100GB bandwidth/month)
- **Render**: Free (750 hours/month)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Total**: $0/month

### Paid Tier (For Production)
- **Vercel Pro**: $20/month (better performance)
- **Render Starter**: $7/month (no sleep, better performance)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)
- **Total**: $52/month

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Use HTTPS only (automatic on Vercel/Render)
- [ ] Set strong SECRET_KEY
- [ ] Limit CORS to your domain only
- [ ] Enable rate limiting (optional)

---

## 📊 Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor bandwidth usage
- Check build times

### Render Dashboard
- View server logs
- Monitor CPU/Memory usage
- Check uptime

### Supabase Dashboard
- Monitor database queries
- Check storage usage
- View API requests

---

## 🚀 Alternative Deployment Options

### Backend Alternatives:
1. **Railway.app** - Similar to Render, $5 free credit
2. **Fly.io** - Global edge deployment
3. **PythonAnywhere** - Easiest for Python
4. **AWS Elastic Beanstalk** - More complex, scalable
5. **Google Cloud Run** - Serverless, pay per use

### Frontend Alternatives:
1. **Netlify** - Similar to Vercel
2. **Cloudflare Pages** - Fast, free
3. **GitHub Pages** - Free, but limited
4. **AWS Amplify** - AWS ecosystem

---

## 📝 Next Steps

1. ✅ Create configuration files (done)
2. ✅ Update API URLs to use environment variables
3. ✅ Deploy backend to Render
4. ✅ Deploy frontend to Vercel
5. ✅ Test all features
6. ✅ Set up custom domain (optional)
7. ✅ Enable monitoring/analytics

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: December 16, 2025
**Status**: Ready for Deployment 🚀
