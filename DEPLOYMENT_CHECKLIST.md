# ✅ Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All features working locally
- [ ] No console errors in browser
- [ ] Backend running without errors
- [ ] Database migrations completed in Supabase
- [ ] All environment variables documented

### Files Created
- [x] `DEPLOYMENT_GUIDE.md` - Full deployment guide
- [x] `QUICK_DEPLOY.md` - Quick 15-minute guide
- [x] `Frontend/.env.production` - Production env template
- [x] `Frontend/.env.example` - Local dev env template
- [x] `Frontend/src/config/api.ts` - Centralized API config
- [x] `backend/render.yaml` - Render configuration
- [x] `backend/requirements.txt` - Updated with gunicorn

### Security
- [ ] `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] Strong SECRET_KEY generated
- [ ] Supabase RLS policies enabled
- [ ] CORS configured for production domain only

---

## Backend Deployment (Render)

### Account Setup
- [ ] Render.com account created
- [ ] GitHub connected to Render
- [ ] Repository access granted

### Service Configuration
- [ ] Web Service created
- [ ] Root directory set to `backend`
- [ ] Python 3 environment selected
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn api:app`
- [ ] Free tier selected

### Environment Variables
- [ ] `SUPABASE_URL` added
- [ ] `SUPABASE_KEY` added
- [ ] `SECRET_KEY` generated and added
- [ ] `FLASK_ENV=production` added

### Deployment
- [ ] Initial deployment successful
- [ ] Backend URL copied
- [ ] Health check endpoint working (`/`)
- [ ] API endpoints responding

---

## Frontend Deployment (Vercel)

### Account Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Repository imported

### Project Configuration
- [ ] Framework preset: Vite
- [ ] Root directory set to `Frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_API_URL` = Backend URL from Render
- [ ] `VITE_SUPABASE_URL` = Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Supabase anon key

### Deployment
- [ ] Initial deployment successful
- [ ] Frontend URL copied
- [ ] App loads without errors
- [ ] API calls working

---

## Post-Deployment Configuration

### CORS Update
- [ ] Update `backend/app/__init__.py` with Vercel domain
- [ ] Remove wildcard CORS (`"*"`)
- [ ] Keep localhost for local development
- [ ] Commit and push changes
- [ ] Verify auto-deployment

### Testing
- [ ] **Authentication**
  - [ ] Register new account
  - [ ] Login with credentials
  - [ ] Logout works
  
- [ ] **Marketplace**
  - [ ] Browse items
  - [ ] Create new listing
  - [ ] Edit listing
  - [ ] Delete listing
  - [ ] Mark as sold
  
- [ ] **Offers**
  - [ ] Make offer on item
  - [ ] Receive offer notification
  - [ ] Accept/Decline offer
  
- [ ] **Messages**
  - [ ] Send message
  - [ ] Receive message
  - [ ] Real-time updates
  
- [ ] **Notifications**
  - [ ] Receive notifications
  - [ ] Click notification navigates correctly
  - [ ] Mark as read works
  - [ ] Clear all works
  
- [ ] **Friends**
  - [ ] Send friend request
  - [ ] Accept friend request
  - [ ] View friends list
  
- [ ] **Meetups**
  - [ ] Create meetup
  - [ ] Accept meetup
  - [ ] Complete meetup
  - [ ] Cancel meetup
  
- [ ] **Request Board**
  - [ ] Create post
  - [ ] Reply to post
  - [ ] Like post
  - [ ] Delete post
  
- [ ] **Profile**
  - [ ] View profile
  - [ ] Edit profile
  - [ ] Upload profile picture
  - [ ] Profile completion tracking
  
- [ ] **Referrals**
  - [ ] Generate referral link
  - [ ] Register with referral code
  - [ ] View referral stats
  - [ ] View leaderboard

---

## Monitoring Setup

### Vercel Dashboard
- [ ] Deployment logs reviewed
- [ ] No build errors
- [ ] Analytics enabled (optional)
- [ ] Custom domain added (optional)

### Render Dashboard
- [ ] Service logs reviewed
- [ ] No runtime errors
- [ ] Health checks passing
- [ ] Auto-deploy enabled

### Supabase Dashboard
- [ ] Database queries monitored
- [ ] Storage usage checked
- [ ] API requests tracked
- [ ] RLS policies verified

---

## Documentation

### Update README
- [ ] Add live demo link
- [ ] Add deployment instructions
- [ ] Update environment variables section
- [ ] Add troubleshooting section

### Team Communication
- [ ] Share live URLs with team
- [ ] Document any known issues
- [ ] Create user guide (optional)
- [ ] Set up feedback channel

---

## Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Domain added to Vercel
- [ ] Domain added to Render

### Performance
- [ ] Enable Vercel Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Configure caching
- [ ] Optimize images

### SEO
- [ ] Add meta tags
- [ ] Create sitemap
- [ ] Add robots.txt
- [ ] Submit to search engines

---

## Maintenance

### Regular Tasks
- [ ] Monitor error logs weekly
- [ ] Check database usage monthly
- [ ] Review bandwidth usage monthly
- [ ] Update dependencies quarterly
- [ ] Backup database monthly

### Scaling Plan
- [ ] Monitor user growth
- [ ] Plan for paid tier upgrade
- [ ] Consider CDN for assets
- [ ] Plan for database scaling

---

## Emergency Contacts

**Render Support**: https://render.com/docs/support
**Vercel Support**: https://vercel.com/support
**Supabase Support**: https://supabase.com/support

---

## Deployment Status

**Backend**: ⏳ Not Deployed
**Frontend**: ⏳ Not Deployed
**Status**: 🟡 Ready for Deployment

---

**Last Updated**: December 16, 2025
**Next Review**: After first deployment
