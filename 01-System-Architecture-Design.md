# Sawasdee Cup 2026 - Registration System Architecture Design

## 📋 System Overview

ระบบการสมัครแข่งขัน Sawasdee Cup 2026 ประกอบด้วย 4 ส่วนหลัก:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│   Frontend      │──────│  Backend        │──────│   Database      │──────│   Email      │
│  (Netlify)      │      │   (Google       │      │  (Google        │      │   System     │
│  HTML/JS/CSS    │      │   Apps Script)  │      │   Sheets)       │      │   (Gmail)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘      └──────────────┘
       ↓                           ↓                       ↓
   Form UI          API Endpoints   ↔   Validation   Database Sync   Email Sender
                    Tag Generation       Processing   Payment Track    Confirmation
```

---

## 🎯 User Journey / Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. นักกีฬา เข้า Website → https://sawasdee-cup-2026.com  │
│     (Netlify hosted)                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. กรอกแบบฟอร์มการสมัคร (Form Validation)                │
│     - ข้อมูลส่วนตัว: ชื่อ, ID, วันเกิด, เพศ, เสื้อ      │
│     - ข้อมูลติดต่อ: อีเมล, เบอร์โทร                        │
│     - เลือกหมวดหมู่: Singles/Doubles/Mixed/etc             │
│     - จำนวน: 1-2 categories เท่านั้น                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Frontend Submit → Backend (Google Apps Script)         │
│     - Validate input                                        │
│     - Check duplicate registration                          │
│     - Generate unique Tag ID                                │
│     - Save to Google Sheets                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Backend Generate & Send Email                           │
│     - Create Tag ID (e.g., SC2026-001-XXXXXX)             │
│     - Include: Confirmation, Fee Amount, Tag ID, Payment   │
│     - Send via Gmail API                                    │
│     - Save Email Log to Sheets                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. นักกีฬา โอนเงิน + แนบสลิปมา → ส่งเมล                  │
│     - To: finance.jadesport@gmail.com                       │
│     - Subject: [TAG-ID] Payment Slip                        │
│     - Body: Invoice number, amount, bank details           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Admin ยืนยันการชำระเงิน                                │
│     - Admin marks payment as verified in Google Sheets      │
│     - System sends "Payment Confirmed" email                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Structure (Google Sheets)

### Sheet 1: `REGISTRATIONS` (Main Database)

```
| Timestamp | Tag_ID | First_Name | Last_Name | ID_Number | DOB | Gender | 
| T-Shirt | Email | Phone | Team | Category_1 | Category_2 | Fee | Status | Notes |
|-----------|--------|-----------|----------|-----------|-------|--------|
| 2026-01-15 10:30 | SC2026-001-ABC123 | John | Doe | 1234567890123 | 1980-05-20 | M |
| L | john@email.com | +66-8-xxxx-xxxx | Team A | Men's Singles 40-44 | Men's Doubles 40-44 | 1500 | Pending | |
|-----------|--------|-----------|----------|-----------|-------|--------|
```

**Columns:**
- `Timestamp` - Auto-filled by form submission
- `Tag_ID` - Unique ID (SC2026-###-XXXXXX)
- `First_Name`, `Last_Name`
- `ID_Number` - Passport/National ID
- `DOB` - Date of Birth (for age calculation)
- `Gender` - M/F/Other
- `T_Shirt` - XS/S/M/L/XL/XXL
- `Email`, `Phone`
- `Team` - Team name (if applicable)
- `Category_1`, `Category_2` - Category selection (max 2)
- `Fee` - Registration fee amount
- `Status` - Pending / Payment_Confirmed / Confirmed
- `Notes` - Admin remarks

---

### Sheet 2: `CATEGORIES` (Reference Data)

```
| Category_ID | Category_Name | Division | Age_Group | Gender | Min_Age | Max_Age | Fee |
|-------------|---------------|----------|-----------|--------|---------|---------|-----|
| 1 | Men's Singles | Amateur | 20-24 | M | 20 | 24 | 1500 |
| 2 | Men's Singles | Amateur | 25-29 | M | 25 | 29 | 1500 |
| 3 | Women's Singles | Amateur | 20-24 | F | 20 | 24 | 1500 |
| 4 | Men's Doubles | Amateur | Combined-100 | M | 40 | 120 | 2000 |
| 5 | Open Division | Open | Under-34 | M,F | 0 | 34 | 2000 |
| ... | ... | ... | ... | ... | ... | ... | ... |
```

---

### Sheet 3: `EMAIL_LOG` (Audit Trail)

```
| Timestamp | Tag_ID | Email | Email_Type | Status | Message_ID | Sent_At |
|-----------|--------|-------|-----------|--------|------------|---------|
| 2026-01-15 10:32 | SC2026-001-ABC123 | john@email.com | Confirmation | Sent | msg_123456 | 2026-01-15 10:32 |
| 2026-01-15 11:45 | SC2026-001-ABC123 | john@email.com | Payment_Reminder | Sent | msg_123457 | 2026-01-15 11:45 |
```

---

### Sheet 4: `PAYMENT_TRACKING` (Payment Verification)

```
| Tag_ID | Amount | Expected_Payment | Payment_Received | Receipt_Date | Payment_Verified | 
| Verified_By | Notes |
|--------|--------|------------------|------------------|--------------|-----------------|
| SC2026-001-ABC123 | 1500 | 1500 | ✓ | 2026-01-16 | Yes | Admin | Slip attached |
```

---

## 💾 Database Schema (Google Sheets Setup)

### Creating Google Sheet

```javascript
// Script to initialize sheets (GAS)
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: REGISTRATIONS
  const regSheet = ss.getSheetByName('REGISTRATIONS') || ss.insertSheet('REGISTRATIONS');
  regSheet.appendRow([
    'Timestamp', 'Tag_ID', 'First_Name', 'Last_Name', 'ID_Number', 'DOB', 
    'Gender', 'T_Shirt', 'Email', 'Phone', 'Team', 'Category_1', 'Category_2',
    'Fee', 'Status', 'Notes'
  ]);
  
  // Sheet 2: CATEGORIES (Reference)
  const catSheet = ss.insertSheet('CATEGORIES');
  catSheet.appendRow([
    'Category_ID', 'Category_Name', 'Division', 'Age_Group', 'Gender', 
    'Min_Age', 'Max_Age', 'Fee'
  ]);
  
  // Sheet 3: EMAIL_LOG
  const logSheet = ss.insertSheet('EMAIL_LOG');
  logSheet.appendRow([
    'Timestamp', 'Tag_ID', 'Email', 'Email_Type', 'Status', 'Message_ID', 'Sent_At'
  ]);
  
  // Sheet 4: PAYMENT_TRACKING
  const paymentSheet = ss.insertSheet('PAYMENT_TRACKING');
  paymentSheet.appendRow([
    'Tag_ID', 'Amount', 'Expected_Payment', 'Payment_Received', 'Receipt_Date',
    'Payment_Verified', 'Verified_By', 'Notes'
  ]);
}
```

---

## 🔧 Backend Architecture (Google Apps Script)

### File Structure

```
github.com/your-org/sawasdee-cup-2026/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to Google Apps Script
├── src/
│   ├── config.gs               # Configuration & credentials
│   ├── server.gs               # HTTP endpoints (doPost)
│   ├── database.gs             # Sheet operations
│   ├── registration.gs         # Registration logic
│   ├── tagGenerator.gs         # Tag ID generation
│   ├── emailService.gs         # Email sending
│   ├── validation.gs           # Input validation
│   └── utils.gs                # Utilities
├── frontend/
│   ├── index.html              # Registration form
│   ├── style.css               # Styling
│   ├── script.js               # Form submission & validation
│   └── confirmation.html       # Success page
├── tests/
│   └── test.gs                 # Unit tests
└── README.md
```

---

## 🌐 Frontend Architecture (Netlify + HTML/JS)

### Netlify Deployment

```bash
# File structure for Netlify
netlify-build/
├── public/
│   ├── index.html              # Registration form
│   ├── confirmation.html       # Success confirmation
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js              # Main app logic
│   │   ├── form-handler.js     # Form submission
│   │   ├── validation.js       # Client-side validation
│   │   └── constants.js        # API endpoints
│   └── assets/
│       └── images/
├── functions/
│   └── gateway.js              # Optional: Proxy to GAS
└── netlify.toml                # Netlify config
```

---

## 📧 Email System

### Email 1: Registration Confirmation

**To:** Athlete's email
**From:** noreply@sawasdee-cup.com (via Gmail)
**Subject:** [Sawasdee Cup 2026] Your Registration Confirmation - Tag ID: SC2026-001-ABC123

```
Dear [First_Name],

Thank you for registering for Sawasdee Cup 2026!

═══════════════════════════════════════════
📋 REGISTRATION DETAILS
═══════════════════════════════════════════

Tag ID:          SC2026-001-ABC123
Name:            [First_Name] [Last_Name]
Categories:      [Category_1], [Category_2]
Registration Fee: 1,500 THB

═══════════════════════════════════════════
💰 PAYMENT INSTRUCTIONS
═══════════════════════════════════════════

Please transfer the fee to:
Bank: Bangkok Bank
Account: Sawasdee Cup 2026
Account No: XXXX XXXX XXXX
Branch: Pattaya

📌 IMPORTANT: Use your Tag ID as the reference/note
Example: "SC2026-001-ABC123"

After payment, please:
1. Take a screenshot of the payment receipt
2. Email it to: finance.jadesport@gmail.com
3. In the subject line, include: [SC2026-001-ABC123]
4. Attach the payment slip

═══════════════════════════════════════════

Questions? Contact: info@sawasdee-cup.com

Best regards,
Sawasdee Cup 2026 Organization Team
```

---

### Email 2: Payment Confirmation (Auto-sent by Admin)

**To:** Athlete's email
**Subject:** [Sawasdee Cup 2026] Payment Confirmed - SC2026-001-ABC123

```
Dear [First_Name],

Your payment has been verified and your registration is confirmed!

Tag ID:  SC2026-001-ABC123
Amount:  1,500 THB
Status:  ✓ CONFIRMED

Tournament dates: 27-29 November 2026
Venue: Eastern National Sports Center, Pattaya

Good luck in the tournament!

Best regards,
Sawasdee Cup 2026 Team
```

---

## 🎫 Tag ID Generation Strategy

### Format
```
SC2026 - [000-999] - [XXXXXX]
  ↓       ↓         ↓
 Year   Sequence   Random
```

**Example:** `SC2026-001-AB7K3M`

### Algorithm (GAS)

```javascript
function generateTagID() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REGISTRATIONS');
  const data = sheet.getDataRange().getValues();
  
  // Get next sequence number
  const sequence = (data.length - 1).toString().padStart(3, '0');
  
  // Generate random 6-character string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `SC2026-${sequence}-${random}`;
}
```

---

## 🔄 API Endpoints (Google Apps Script)

### Endpoint 1: Submit Registration

**Request:**
```javascript
POST https://script.google.com/macros/d/{SCRIPT_ID}/usercache/google_apps_script

{
  "action": "register",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "idNumber": "1234567890123",
    "dob": "1980-05-20",
    "gender": "M",
    "tshirt": "L",
    "email": "john@email.com",
    "phone": "+66-8-xxxx-xxxx",
    "team": "Team A",
    "category1": "Men's Singles 40-44",
    "category2": "Men's Doubles 40-44"
  }
}
```

**Response (Success):**
```javascript
{
  "success": true,
  "tagID": "SC2026-001-ABC123",
  "message": "Registration successful",
  "fee": 1500,
  "redirectUrl": "/confirmation.html?tag=SC2026-001-ABC123"
}
```

**Response (Error):**
```javascript
{
  "success": false,
  "error": "Duplicate registration",
  "message": "You are already registered with this email"
}
```

### Endpoint 2: Get Categories

**Request:**
```javascript
POST https://script.google.com/macros/d/{SCRIPT_ID}/usercache/google_apps_script

{
  "action": "getCategories"
}
```

**Response:**
```javascript
{
  "success": true,
  "categories": [
    {
      "id": "1",
      "name": "Men's Singles 20-24",
      "division": "Amateur",
      "fee": 1500,
      "minAge": 20,
      "maxAge": 24
    },
    ...
  ]
}
```

---

## 🛡️ Validation Rules (Frontend & Backend)

### Client-Side (JavaScript)
```javascript
const validationRules = {
  firstName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  dob: {
    required: true,
    minAge: 15,  // Must be at least 15 years old
    maxAge: 120
  },
  categories: {
    maxSelection: 2,
    noDuplicates: true,
    sameEventCheck: true  // Can't register for same event in different age groups
  }
};
```

### Server-Side (GAS)
```javascript
function validateRegistration(data) {
  const errors = [];
  
  // Check email not duplicated
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REGISTRATIONS');
  const emails = sheet.getRange('I:I').getValues();
  if (emails.some(e => e[0] === data.email)) {
    errors.push('Email already registered');
  }
  
  // Check age is valid for selected categories
  const birthYear = new Date(data.dob).getFullYear();
  const age = new Date().getFullYear() - birthYear;
  
  // Validate against category requirements
  // ... more validation
  
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

---

## 🔐 Security Considerations

```
┌─────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION                                    │
│    - GAS script URL protection (require verification)│
│    - CORS policy for Netlify domain only             │
│    - Rate limiting (max 10 requests per min/IP)      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 2. DATA PROTECTION                                   │
│    - Google Sheets: Share with authorized admins     │
│    - Sensitive data: Email, Phone (private)          │
│    - Payment slips: Separate from public registration│
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 3. EMAIL SECURITY                                    │
│    - Gmail API with OAuth 2.0                        │
│    - Credentials stored in GAS (ScriptProperties)    │
│    - Email logs for audit trail                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 4. FRAUD PREVENTION                                  │
│    - Duplicate email check                           │
│    - Age verification vs DOB                         │
│    - Category eligibility validation                 │
│    - Payment receipt verification by admin           │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Deployment Flow

### 1. GitHub to Google Apps Script

```yaml
# .github/workflows/deploy.yml
name: Deploy to Google Apps Script
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GAS
        uses: google-github-actions/deploy-apps-script@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          deployment_id: ${{ secrets.GAS_DEPLOYMENT_ID }}
```

### 2. GitHub to Netlify

```bash
# Connected via Netlify UI
# Auto-deploys on push to main
```

### 3. Local Development

```bash
# Frontend development
cd frontend
npm install
npm start    # Local development server

# Backend development (GAS)
# Use clasp: npm install -g @google/clasp
clasp login
clasp clone {PROJECT_ID}
clasp push    # Deploy changes
```

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

```javascript
function trackMetrics() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('REGISTRATIONS');
  const data = sheet.getDataRange().getValues();
  
  return {
    totalRegistrations: data.length - 1,
    pendingPayments: data.filter(r => r[14] === 'Pending').length,
    confirmedRegistrations: data.filter(r => r[14] === 'Confirmed').length,
    totalFeesCollected: calculateTotalFees(),
    registrationsByCategory: groupByCategory(),
    registrationsByDivision: groupByDivision()
  };
}
```

---

## 🚀 Implementation Timeline

```
Week 1:  Setup GitHub repo + Database schema
Week 2:  Build backend (GAS) + Email service
Week 3:  Build frontend (Netlify) + Form validation
Week 4:  Integration testing + Security audit
Week 5:  UAT + Bug fixes + Launch
Week 6:  Monitor + Support
```

---

## ✅ Testing Checklist

- [ ] Form validation (client & server)
- [ ] Tag ID generation (uniqueness)
- [ ] Email sending (SMTP testing)
- [ ] Payment tracking workflow
- [ ] Age calculation accuracy
- [ ] Category eligibility rules
- [ ] Duplicate detection
- [ ] Error handling & recovery
- [ ] Load testing (concurrent registrations)
- [ ] Security testing (SQL injection, XSS)

---

## 📞 Support & Contacts

| Role | Contact | Responsibility |
|------|---------|-----------------|
| Admin | finance.jadesport@gmail.com | Payment verification, registration approval |
| Tech Support | tech@sawasdee-cup.com | System maintenance, bug fixes |
| Event Organizer | info@sawasdee-cup.com | General inquiries |

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-13  
**Status:** Ready for Development
