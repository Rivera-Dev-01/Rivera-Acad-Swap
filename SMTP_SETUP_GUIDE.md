# Gmail SMTP Setup for Feedback Feature

## Quick Setup (5 minutes)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps to enable it

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Acad Swap Feedback"
4. Click "Generate"
5. **Copy the 16-character password** (you won't see it again!)

### Step 3: Add to Render Environment Variables

Go to your Render dashboard and add these environment variables:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = Rivera.dev.miggy@gmail.com
SMTP_PASS = [your-16-character-app-password]
FEEDBACK_EMAIL_TO = Rivera.dev.miggy@gmail.com
```

### Step 4: Redeploy

Render will automatically redeploy when you save the environment variables.

---

## Testing

1. Go to your deployed app
2. Navigate to Feedback page
3. Submit a test feedback
4. Check your email inbox!

---

## Troubleshooting

### Error: "SMTP configuration missing"
- Make sure all environment variables are set in Render
- Check for typos in variable names

### Error: "Authentication failed"
- Make sure you're using an App Password, not your regular Gmail password
- Verify the App Password is correct (no spaces)

### Error: "Connection timeout"
- Check if SMTP_HOST is `smtp.gmail.com`
- Check if SMTP_PORT is `587`

### Still not working?
Check Render logs for detailed error messages:
1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for "SMTP Error" or "Feedback email error"

---

## Alternative: Use a Different Email Service

If Gmail doesn't work, you can use:

### SendGrid (Free tier: 100 emails/day)
```
SMTP_HOST = smtp.sendgrid.net
SMTP_PORT = 587
SMTP_USER = apikey
SMTP_PASS = [your-sendgrid-api-key]
```

### Mailgun (Free tier: 5,000 emails/month)
```
SMTP_HOST = smtp.mailgun.org
SMTP_PORT = 587
SMTP_USER = [your-mailgun-smtp-username]
SMTP_PASS = [your-mailgun-smtp-password]
```

---

## Current Configuration

The feedback system will:
- ✅ Log all feedback to Render console (always works)
- ✅ Send email if SMTP is configured
- ✅ Show detailed error messages in logs
- ✅ Not crash if email fails

So even if email doesn't work, you can still see feedback in the Render logs!
