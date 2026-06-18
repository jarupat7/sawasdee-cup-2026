# 🚀 Sawasdee Cup 2026 - Quick Start Guide (5 Steps)

**Time to launch: 2-3 weeks**

---

## ⚡ 30-Second Overview

```
Your system has 3 parts:

1️⃣  DATABASE          2️⃣  BACKEND             3️⃣  FRONTEND
   Google Sheets        Google Apps Script      Netlify
   
   Stores data          Processes forms         Players see this
```

---

## 🎯 Step 1: Setup Database (30 minutes)

### 1.1 Create Google Sheet

```
👉 Go to: https://drive.google.com
👉 Click: New → Google Sheets
👉 Name: "Sawasdee Cup 2026 - Registrations"
👉 Share with: finance.jadesport@gmail.com
```

### 1.2 Create 4 Sheets with Headers

**Sheet 1: REGISTRATIONS**
```
Columns:
Timestamp | Tag_ID | First_Name | Last_Name | ID_Number | DOB | Gender | 
T_Shirt | Email | Phone | Team | Category_1 | Category_2 | Fee | Status | Notes
```

**Sheet 2: CATEGORIES** (Sample data)
```
Category_ID | Category_Name | Division | Age_Group | Gender | Min_Age | Max_Age | Fee
1 | Men's Singles 20-24 | Amateur | 20-24 | M | 20 | 24 | 1500
2 | Men's Singles 25-29 | Amateur | 25-29 | M | 25 | 29 | 1500
... (add all categories from rules document)
```

**Sheet 3: EMAIL_LOG**
```
Timestamp | Tag_ID | Email | Email_Type | Status | Message_ID | Sent_At
```

**Sheet 4: PAYMENT_TRACKING**
```
Tag_ID | Amount | Expected_Payment | Payment_Received | Receipt_Date | 
Payment_Verified | Verified_By | Notes
```

### 1.3 Get Your Sheet ID

```
📝 Copy from URL:
https://docs.google.com/spreadsheets/d/[YOUR_SHEET_ID]/edit

💾 Save this ID - you'll need it later!
```

---

## 🎯 Step 2: Setup Backend (45 minutes)

### 2.1 Create Google Apps Script Project

```
👉 Go to: https://script.google.com
👉 Click: New Project
👉 Name: "Sawasdee Cup 2026 Backend"
👉 Get Script ID from: Project Settings
💾 Save this ID
```

### 2.2 Create Code Files

In Google Apps Script, create these files with code from `02-Implementation-Guide.md`:

**Files to create:**
- `config.gs` - Update `SHEET_ID` with your Sheet ID
- `database.gs`
- `validation.gs`
- `tagGenerator.gs`
- `emailService.gs`
- `registration.gs`
- `server.gs`

**Copy-paste code from Implementation Guide (Phase 2) for each file**

### 2.3 Deploy as Web App

```
👉 Click: Deploy → New deployment
👉 Select type: Web app
👉 Execute as: Your account
👉 Who has access: Anyone
👉 Click: Deploy
👉 Copy the deployment URL
💾 Save this URL - format: https://script.google.com/macros/d/{ID}/usercache
```

### 2.4 Setup Email (Gmail API)

**Simple method (for testing):**
- GAS can send 100 emails/day for free
- Just use `GmailApp.sendEmail()` - no setup needed!

**Advanced (for production):**
1. Go to: https://console.cloud.google.com
2. Create project: "Sawasdee Cup 2026"
3. Enable Gmail API
4. Create OAuth credentials
5. Link to GAS Project Settings

---

## 🎯 Step 3: Setup Frontend (30 minutes)

### 3.1 Create Netlify Account

```
👉 Go to: https://app.netlify.com
👉 Sign up with GitHub
👉 Or use email signup
```

### 3.2 Create GitHub Repository

```bash
# Option 1: Using GitHub web
👉 Go to: https://github.com/new
👉 Repository name: sawasdee-cup-2026
👉 Make it Private
👉 Create

# Option 2: Using command line
git init sawasdee-cup-2026
cd sawasdee-cup-2026
git remote add origin https://github.com/your-username/sawasdee-cup-2026.git
```

### 3.3 Create Frontend Files

Create this folder structure:

```
sawasdee-cup-2026/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── confirmation.html
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── app.js
│   │       ├── constants.js
│   │       ├── form-handler.js
│   │       └── validation.js
│   └── netlify.toml
└── README.md
```

**Copy-paste code from Implementation Guide (Phase 3) for each file**

### 3.4 Update Configuration

Edit `frontend/public/js/constants.js`:

```javascript
const API_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/d/[YOUR_DEPLOYMENT_ID]/usercache',
  FRONTEND_URL: 'https://sawasdee-cup-2026.netlify.app'
};
```

Replace `[YOUR_DEPLOYMENT_ID]` with URL from Step 2.3

### 3.5 Deploy to Netlify

```
👉 Go to: https://app.netlify.com
👉 Click: New site from Git
👉 Select GitHub repo: sawasdee-cup-2026
👉 Build command: (leave blank)
👉 Publish directory: frontend/public
👉 Click: Deploy site

💾 Your site is now live!
👉 Copy your Netlify URL (e.g., https://sawasdee-cup-2026.netlify.app)
```

---

## 🎯 Step 4: Test Everything (30 minutes)

### 4.1 Test Registration Form

```
1. Go to your Netlify site URL
2. Fill out form with test data:
   - Name: Test Player
   - Email: your-test-email@gmail.com
   - DOB: 1980-05-20
   - Category: Men's Singles 40-44
   - Select terms agreement
3. Click Submit
```

### 4.2 Check Results

```
✓ Confirmation page appears with Tag ID
✓ Check Google Sheet → REGISTRATIONS (new row added)
✓ Check Gmail inbox → Confirmation email received
```

### 4.3 Test Payment Verification

```
1. Go to Google Sheet → PAYMENT_TRACKING
2. Find your test registration row
3. Update:
   - Payment_Received: ✓
   - Payment_Verified: Yes
   - Verified_By: Your name
4. Wait 1-2 minutes
5. Check email → Payment confirmation email received
6. Check Google Sheet → REGISTRATIONS status = "Confirmed"
```

---

## ✅ Step 5: Go Live! (Setup only)

### 5.1 Before Launch Checklist

```
Database Setup:
☐ Google Sheet created with all 4 sheets
☐ Categories data filled in
☐ Sheet shared with admin emails

Backend Setup:
☐ GAS project created
☐ All .gs files uploaded with correct SHEET_ID
☐ Deployed as Web app
☐ Deployment URL saved

Frontend Setup:
☐ All HTML/CSS/JS files created
☐ constants.js updated with GAS_URL
☐ Deployed to Netlify
☐ Form works with test data
☐ Emails send correctly

Payment System:
☐ Admin email (finance.jadesport@gmail.com) ready
☐ Payment verification tested
☐ Payment confirmation email tested

☐ Performance tested (forms load fast)
☐ Mobile responsive (test on phone)
☐ All links work
☐ Error messages display correctly
```

### 5.2 Create Admin Guide

Send to admin (finance.jadesport@gmail.com):

```
📧 Subject: Sawasdee Cup 2026 - Admin Instructions

Hi,

Your admin role:

1. Players will send payment slips to: finance.jadesport@gmail.com
2. Check the Google Sheet for new registrations
3. When you receive payment, update PAYMENT_TRACKING:
   - Payment_Received: Yes
   - Receipt_Date: Today
   - Payment_Verified: Yes
   - Verified_By: Your name

4. System automatically sends confirmation email to player

Questions? Check: 03-Admin-Payment-System.md

Thanks,
[Your Name]
```

### 5.3 Announce to Players

```
🏸 Registration is now open!

👉 Register at: https://sawasdee-cup-2026.netlify.app

What happens:
1. Fill form
2. Get Tag ID via email
3. Transfer fee to bank account (use Tag ID as reference)
4. Email receipt to: finance.jadesport@gmail.com
5. Wait for payment confirmation

Tournament: 27-29 November 2026
Venue: Eastern National Sports Center, Pattaya

Questions? Email: info@sawasdee-cup.com
```

---

## 📋 Configuration Checklist

### Google Sheet IDs to Save

```
SHEET_ID: [Copy from URL]
```

### GAS Deployment URL

```
GAS_URL: https://script.google.com/macros/d/[ID]/usercache
```

### Netlify Site URL

```
FRONTEND_URL: https://sawasdee-cup-2026.netlify.app
```

### Update These Files

1. `backend/src/config.gs` - Add SHEET_ID
2. `frontend/public/js/constants.js` - Add GAS_URL

---

## 🆘 Common Issues & Solutions

### Issue: Form submits but no confirmation email

**Solution:**
1. Check Google Apps Script Logs: Run → View Logs
2. Check Gmail spam folder
3. Check email address in form is correct
4. GAS can send 100/day - are you over limit?

### Issue: Emails not sending

**Solution:**
1. Enable Gmail API (advanced setup)
2. Or create Gmail app password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select Mail + App: Windows Computer
   - Copy password
   - Add to GAS ScriptProperties

### Issue: Form data not saving to Google Sheet

**Solution:**
1. Check Sheet ID in config.gs matches your sheet
2. Check SHEET_NAMES match your sheet tabs exactly
3. Check permissions: Sheet must be accessible to GAS account

### Issue: "CORS error" when submitting form

**Solution:**
1. Check GAS deployment is public ("Anyone" access)
2. Check GAS_URL in constants.js is correct
3. Clear browser cache and try again

### Issue: Tag ID not generating

**Solution:**
1. Check TagIDGenerator class is in GAS
2. Check database.gs getAllRegistrations() works
3. Manually generate Tag ID format: SC2026-001-RANDOM6CHARS

---

## 📞 Technical Support Quick Links

| Issue | Link/Code |
|-------|-----------|
| GAS Logs | Google Apps Script → Run → View Logs |
| Gmail Settings | https://myaccount.google.com/apppasswords |
| Netlify Deploy | https://app.netlify.app → Pick site → Deploys |
| Google Sheet | https://drive.google.com |
| GitHub Repo | https://github.com/your-username/sawasdee-cup-2026 |

---

## 📚 Full Documentation Files

If you need more details:

- `01-System-Architecture-Design.md` - How the system works
- `02-Implementation-Guide.md` - Code for each component
- `03-Admin-Payment-System.md` - Payment verification details
- `04-QUICK-START.md` - This file!

---

## 🎉 Success Indicators

Your system is working when:

✅ Form submissions create new rows in Google Sheet
✅ Tag IDs are unique (SC2026-001-ABC123, SC2026-002-XYZ789)
✅ Confirmation emails send automatically
✅ Admin can mark payment verified
✅ Payment confirmation emails send to players
✅ Mobile form is responsive
✅ System handles 100+ concurrent users

---

## 🚀 Next Phase: Launch Promotion

Once system is live:

```
Week 1: Soft launch (friends & family test)
Week 2: Announce to community
Week 3: Monitor registrations
Week 4-8: Continue accepting registrations
```

---

**Ready to launch? Start with Step 1! 🚀**

Questions? Check the detailed guides above or email: [your-support-email]

---

**Last Updated:** 2026-05-13  
**Version:** 1.0
