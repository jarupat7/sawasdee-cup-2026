# Sawasdee Cup 2026 Registration System

## 📋 Project Overview

This is a **complete, production-ready registration system** for Sawasdee Cup 2026 badminton tournament. Players register online, pay via bank transfer, and admins verify payments.

---

## 🎯 What You Get

✅ **Online Registration Form** - Players fill form, get Tag ID instantly
✅ **Automatic Emails** - Confirmation + Payment Instructions sent via email
✅ **Payment Tracking** - Admin verifies payments in Google Sheets
✅ **Database** - All data stored in Google Sheets (easy to manage)
✅ **Zero Cost** - Uses free tiers of Google & Netlify

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        PLAYER JOURNEY                        │
└─────────────────────────────────────────────────────────────┘

     1. VISIT                   2. REGISTER               3. PAY
  Registration Form            Get Tag ID              Transfer Fee
        ↓                           ↓                       ↓
   https://netlify             SC2026-001-ABC123   Transfer to Bank
   Fill in details         Get confirmation email    Include Tag ID
                                                            ↓
                          4. VERIFY                  5. RECEIVE EMAIL
                      Admin checks payment      Payment confirmed!
                          ↓
                   Update Google Sheet
                      ↓
                   Auto-send email to player
                      ↓
                   Player is REGISTERED!
```

---

## 📚 Documentation Structure

| Document | Purpose | Who Needs |
|----------|---------|-----------|
| **01-System-Architecture-Design.md** | How everything works | Developers, Tech team |
| **02-Implementation-Guide.md** | Step-by-step code + setup | Developers |
| **03-Admin-Payment-System.md** | Payment verification process | Admin staff |
| **04-QUICK-START.md** | 5-step launch guide | Everyone |
| **README.md** | This file | Everyone |

---

## 🚀 Quick Start (5 Steps, 2-3 weeks)

### Step 1: Create Database
```
👉 Go to Google Drive
👉 Create Google Sheet with 4 tabs:
   - REGISTRATIONS
   - CATEGORIES
   - EMAIL_LOG
   - PAYMENT_TRACKING
💾 Save Sheet ID
```

### Step 2: Setup Backend
```
👉 Create Google Apps Script project
👉 Copy .gs files from 02-Implementation-Guide.md
👉 Deploy as Web app
💾 Save deployment URL
```

### Step 3: Setup Frontend
```
👉 Create GitHub repo
👉 Copy frontend files from 02-Implementation-Guide.md
👉 Deploy to Netlify
💾 Save site URL
```

### Step 4: Test
```
👉 Fill test registration
✓ Check confirmation email
✓ Check Google Sheet
```

### Step 5: Go Live!
```
👉 Update bank details in email template
👉 Share registration link with players
👉 Announce!
```

**→ See `04-QUICK-START.md` for detailed steps**

---

## 💾 Technology Stack

| Component | Technology | Cost |
|-----------|-----------|------|
| **Database** | Google Sheets | FREE |
| **Backend** | Google Apps Script (GAS) | FREE |
| **Frontend** | HTML/CSS/JavaScript | FREE |
| **Hosting** | Netlify | FREE |
| **Email** | Gmail API | FREE (100/day) |
| **Version Control** | GitHub | FREE |
| **Domain** | Optional | $12-15/year |

**Total Cost: $0 (or $12-15/year with custom domain)**

---

## 📊 Data Flow

```
FRONTEND                BACKEND              DATABASE
(Netlify)          (Google Apps Script)   (Google Sheets)
    ↓                      ↓                    ↓
┌─────────┐          ┌──────────┐         ┌──────────┐
│ Player  │          │ Validate │         │ Store    │
│ Form    │ -----→   │ Data     │ ----→  │ Record   │
│ HTML    │          │ Generate │         │ Auto     │
│         │          │ Tag ID   │         │ Email    │
│ CSS/JS  │          │ Send     │         │ Log      │
│         │          │ Email    │         │          │
└─────────┘          └──────────┘         └──────────┘
                           ↓
                      ┌──────────┐
                      │ Gmail    │
                      │ API      │
                      │          │
                      │ Send     │
                      │ Email    │
                      └──────────┘
                           ↓
                      Player inbox
```

---

## 🎫 User Registration Flow

```
┌──────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                          │
│    Player opens: https://sawasdee-cup-2026.netlify.app  │
│    Fills: Name, Email, Category, etc.                   │
│    Clicks: Submit                                        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. BACKEND PROCESSING (Google Apps Script)              │
│    ✓ Validates email format                             │
│    ✓ Checks age eligibility                             │
│    ✓ Checks for duplicates                              │
│    ✓ Generates Tag ID: SC2026-001-ABC123                │
│    ✓ Saves to Google Sheet                              │
│    ✓ Sends confirmation email                           │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 3. CONFIRMATION EMAIL SENT                              │
│    To: player@email.com                                 │
│    Subject: Registration Confirmed - Tag ID             │
│    Contains:                                            │
│    - Tag ID (must use in payment reference)             │
│    - Bank account details                               │
│    - Fee amount (1,500 - 2,000 THB)                     │
│    - Payment instructions                               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 4. PLAYER TRANSFERS MONEY                               │
│    - Go to bank                                         │
│    - Transfer amount to: Sawasdee Cup 2026              │
│    - Reference/Note: SC2026-001-ABC123 (TAG ID)        │
│    - Take screenshot/receipt                            │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 5. PLAYER SENDS RECEIPT                                 │
│    To: finance.jadesport@gmail.com                      │
│    Subject: [SC2026-001-ABC123] Payment Slip            │
│    Attachment: Screenshot of bank transfer              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 6. ADMIN VERIFICATION                                   │
│    Admin opens: Google Sheet → PAYMENT_TRACKING         │
│    Finds: SC2026-001-ABC123                             │
│    Updates: Payment_Verified = Yes                      │
│    System sends email to player: "Payment confirmed!"   │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ ✓ PLAYER IS REGISTERED & PAID                           │
│   Status: CONFIRMED                                     │
└──────────────────────────────────────────────────────────┘
```

---

## 📧 Emails Sent by System

### Email 1: Registration Confirmation
```
From: noreply@sawasdee-cup.com
To: player@email.com
Subject: [Sawasdee Cup 2026] Registration Confirmation - Tag ID: SC2026-001-ABC123

✓ Contains: Tag ID, Fee, Bank Account, Payment Instructions
⏱ Sent: Immediately after registration
```

### Email 2: Payment Confirmed (Admin sends)
```
From: noreply@sawasdee-cup.com
To: player@email.com
Subject: [Sawasdee Cup 2026] Payment Confirmed - SC2026-001-ABC123

✓ Contains: Confirmation that payment received
⏱ Sent: When admin marks payment verified
```

---

## 📊 Sample Data Structure

### Registration Example

```
Timestamp:      2026-01-15 10:30 AM
Tag_ID:         SC2026-001-ABC123
Name:           John Doe
Email:          john@email.com
ID Number:      1234567890123
DOB:            1980-05-20
Gender:         Male
T-Shirt:        L
Phone:          +66-8-1234-5678
Team:           Team A
Category_1:     Men's Singles 40-44
Category_2:     Men's Doubles 40-44
Fee:            3,500 THB (1,500 + 2,000)
Status:         Pending
```

### Payment Tracking Example

```
Tag_ID:              SC2026-001-ABC123
Amount:              3,500 THB
Payment_Received:    ✓ Yes
Receipt_Date:        2026-01-16
Payment_Verified:    Yes
Verified_By:         Admin Name
Notes:               Bank Ref: 123456789
```

---

## 🔐 Security Features

✅ **Duplicate Prevention** - Can't register same email twice
✅ **Age Verification** - Checks DOB against category requirements
✅ **Data Validation** - Frontend & backend validation
✅ **Email Verification** - Admins verify payment manually
✅ **Audit Trail** - All actions logged in Google Sheets
✅ **No Payment Processing** - Uses bank transfer (safer than credit card)

---

## 📈 Expected Statistics

```
Based on 2025 data:

Estimated Registrations:     50-100 players
Average Registration Fee:    1,500-2,000 THB per player
Total Expected Revenue:      75,000-200,000 THB
Email Volume:               100-200 emails
Payment Processing:         Completed within 2-3 days
```

---

## 🔧 Customization Options

### Easy Customizations (No coding)

```
✓ Change tournament dates
✓ Change fees
✓ Add/remove categories
✓ Change email text
✓ Update bank account details
✓ Change form fields
```

**How:** Edit Google Sheet or email templates

### Medium Customizations (Some coding)

```
✓ Add logo to emails
✓ Custom confirmation page design
✓ Different fee structure by category
✓ Age cutoff calculation
```

**How:** Modify HTML/CSS in frontend or GAS script

### Hard Customizations (Advanced coding)

```
✓ SMS notifications
✓ WhatsApp integration
✓ Payment gateway integration (Omise, 2Checkout)
✓ Admin approval workflow
✓ Custom reporting
```

**How:** Extend GAS or use third-party APIs

---

## 📞 Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Form won't submit | Check GAS deployment URL in constants.js |
| No confirmation email | Check spam folder, check email spelling |
| Payment not updating | Check Sheet ID in config.gs |
| Mobile form broken | Check CSS is loaded (browser cache) |
| Emails not sending | Check Gmail API enabled, check email quota |

### Getting Help

1. Check `04-QUICK-START.md` → "Common Issues"
2. Check GAS Logs: Run → View Logs
3. Check browser console: F12 → Console tab
4. Check Gmail spam folder
5. Contact technical support with error message

---

## 📋 Pre-Launch Checklist

### Week 1-2: Setup
- [ ] Google Sheet created
- [ ] GAS project created and deployed
- [ ] GitHub repo created
- [ ] Frontend deployed to Netlify
- [ ] All files uploaded correctly

### Week 2-3: Testing
- [ ] Test registration form works
- [ ] Test confirmation email received
- [ ] Test payment verification flow
- [ ] Test on mobile device
- [ ] Test with 10+ test registrations

### Week 3: Configuration
- [ ] Update email template with real bank details
- [ ] Test with real payment (small amount)
- [ ] Verify admin email setup
- [ ] Create admin instructions document
- [ ] Test payment confirmation flow

### Week 3-4: Launch
- [ ] Send admin guide to finance team
- [ ] Create registration announcement
- [ ] Test 24 hours before launch
- [ ] Share registration link with players
- [ ] Monitor first registrations closely

---

## 📦 What's Included in This Package

```
📁 sawasdee 2026/
├── 📄 README.md (this file)
├── 📄 01-System-Architecture-Design.md
│   └── How the system works, data models, flow diagrams
├── 📄 02-Implementation-Guide.md
│   └── Complete code for all components
├── 📄 03-Admin-Payment-System.md
│   └── Payment verification instructions
└── 📄 04-QUICK-START.md
    └── 5-step launch guide
```

---

## 🎯 Success Metrics

Your system is working when:

```
✓ Form submits without errors
✓ Confirmation email arrives in 1-2 minutes
✓ Tag ID appears on confirmation page
✓ Google Sheet auto-updates with registration
✓ Payment status updates in spreadsheet
✓ Admin can mark payment verified
✓ Player receives payment confirmation email
✓ Mobile form displays correctly
✓ System handles 100+ users without errors
✓ All emails are formatted correctly
```

---

## 🚀 Next Steps

1. **Start with Step 1:** Read `04-QUICK-START.md`
2. **Follow the guide:** Setup database, backend, frontend (in order)
3. **Test thoroughly:** Use test data, verify all emails
4. **Configure:** Update bank details, email templates
5. **Launch:** Share registration link with players

---

## 📞 Contact & Support

| Role | Email | Responsibility |
|------|-------|-----------------|
| **Admin** | finance.jadesport@gmail.com | Payment verification |
| **Tech Support** | (your email) | System maintenance |
| **Tournament Info** | info@sawasdee-cup.com | General questions |

---

## 📄 Document Versions

| Doc | Version | Updated | Status |
|-----|---------|---------|--------|
| System Architecture | 1.0 | 2026-05-13 | ✓ Ready |
| Implementation Guide | 1.0 | 2026-05-13 | ✓ Ready |
| Admin System | 1.0 | 2026-05-13 | ✓ Ready |
| Quick Start | 1.0 | 2026-05-13 | ✓ Ready |
| README | 1.0 | 2026-05-13 | ✓ Ready |

---

## 📸 Screenshots to Add Later

```
(In actual implementation, add:)
- Registration form screenshot
- Confirmation email screenshot
- Payment tracking sheet screenshot
- Admin dashboard screenshot
- Mobile form view
```

---

## 🎓 Learning Resources

If you need to learn about technologies used:

- **Google Apps Script:** https://developers.google.com/apps-script
- **HTML/CSS/JavaScript:** https://developer.mozilla.org/en-US/
- **Google Sheets API:** https://developers.google.com/sheets/api
- **Netlify Docs:** https://docs.netlify.com
- **GitHub Basics:** https://github.com/git-tips/tips

---

## ✅ Final Verification

Before launching, verify:

```
[ ] All documents reviewed and understood
[ ] Technical team assigned to each component
[ ] Admin team trained on payment verification
[ ] Bank account details confirmed
[ ] Email addresses verified
[ ] Test registration completed successfully
[ ] Payment verification flow tested
[ ] Mobile device compatibility verified
[ ] Error messages user-friendly
[ ] Email templates professional and complete
```

---

## 🎉 You're Ready!

You have all the information needed to launch a professional registration system for Sawasdee Cup 2026.

**Start with: `04-QUICK-START.md` (5 Steps, 2-3 weeks)**

Good luck! 🏸

---

**Questions?** Review the relevant document or check troubleshooting section.

**Ready to start?** → Open `04-QUICK-START.md` now!

---

*Last Updated: 2026-05-13*  
*Version: 1.0 - Complete Package*  
*Status: Ready for Implementation* ✓
