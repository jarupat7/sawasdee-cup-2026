# Sawasdee Cup 2026 - Step-by-Step Implementation Guide

## 🎯 Overview

This guide walks you through building the registration system step-by-step, from database setup to deployment.

---

## PHASE 1: Setup & Configuration

### Step 1.1: Create GitHub Repository

```bash
# Create on github.com:
Repository: sawasdee-cup-2026
Description: Registration system for Sawasdee Cup 2026
Private: Yes
Initialize with: .gitignore (Node), README.md

# Clone locally:
git clone https://github.com/your-org/sawasdee-cup-2026.git
cd sawasdee-cup-2026
```

**Folder Structure:**
```
sawasdee-cup-2026/
├── .github/workflows/deploy.yml
├── .gitignore
├── README.md
├── backend/
│   ├── src/
│   │   ├── config.gs
│   │   ├── server.gs
│   │   ├── database.gs
│   │   ├── registration.gs
│   │   ├── tagGenerator.gs
│   │   ├── emailService.gs
│   │   ├── validation.gs
│   │   └── utils.gs
│   ├── tests/
│   └── appsscript.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── confirmation.html
│   │   ├── css/style.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── form-handler.js
│   │   │   ├── validation.js
│   │   │   └── constants.js
│   │   └── assets/
│   ├── package.json
│   └── netlify.toml
└── docs/
```

---

### Step 1.2: Setup Google Sheet

**What to do:**
1. Go to Google Drive: https://drive.google.com
2. Create new Google Sheet: "Sawasdee Cup 2026 - Registrations"
3. Share it with your admin email (finance.jadesport@gmail.com)

**Get the Sheet ID:**
- Open the sheet
- Copy the ID from URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
- Save this ID - you'll need it later

**Initialize Sheets:**
Create 4 sheets with these headers:

**Sheet 1: REGISTRATIONS**
```
A: Timestamp
B: Tag_ID
C: First_Name
D: Last_Name
E: ID_Number
F: DOB
G: Gender
H: T_Shirt
I: Email
J: Phone
K: Team
L: Category_1
M: Category_2
N: Fee
O: Status (Pending/Payment_Confirmed/Confirmed)
P: Notes
```

**Sheet 2: CATEGORIES**
```
A: Category_ID
B: Category_Name
C: Division (Amateur/Open)
D: Age_Group
E: Gender
F: Min_Age
G: Max_Age
H: Fee
```

**Sheet 3: EMAIL_LOG**
```
A: Timestamp
B: Tag_ID
C: Email
D: Email_Type (Confirmation/Payment_Reminder/etc)
E: Status (Sent/Failed)
F: Message_ID
G: Sent_At
```

**Sheet 4: PAYMENT_TRACKING**
```
A: Tag_ID
B: Amount
C: Expected_Payment
D: Payment_Received
E: Receipt_Date
F: Payment_Verified (Yes/No)
G: Verified_By (Admin name)
H: Notes
```

---

### Step 1.3: Setup Google Apps Script Project

**What to do:**
1. Go to Google Apps Script: https://script.google.com
2. Create new project: "Sawasdee Cup 2026 Backend"
3. Get the Script ID (from Project Settings)

**Create config file** (`backend/src/config.gs`):

```javascript
// Configuration constants
const CONFIG = {
  // Google Sheets
  SHEET_ID: "YOUR_GOOGLE_SHEET_ID_HERE",
  SHEET_NAMES: {
    registrations: "REGISTRATIONS",
    categories: "CATEGORIES",
    emailLog: "EMAIL_LOG",
    paymentTracking: "PAYMENT_TRACKING"
  },
  
  // Gmail
  EMAIL_FROM: "noreply@sawasdee-cup.com",
  EMAIL_ADMIN: "finance.jadesport@gmail.com",
  
  // Frontend
  FRONTEND_URL: "https://sawasdee-cup-2026.netlify.app",
  
  // Registration fees (in THB)
  FEES: {
    singles: 1500,
    doubles: 2000,
    mixedDoubles: 2000
  },
  
  // Tournament info
  TOURNAMENT: {
    name: "Sawasdee Cup 2026",
    dates: "27-29 November 2026",
    venue: "Eastern National Sports Center, Pattaya"
  }
};

// Store sensitive data in Script Properties
function storeCredentials() {
  // These should be set manually in Project Settings > Script Properties
  // Or use this function template:
  const scriptProperties = PropertiesService.getScriptProperties();
  // scriptProperties.setProperty('GMAIL_EMAIL', 'your-email@gmail.com');
  // scriptProperties.setProperty('GMAIL_PASSWORD', 'your-app-password');
}

function getCredentials(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
```

---

### Step 1.4: Setup Gmail API for Email Sending

**What to do:**
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create new project: "Sawasdee Cup 2026"
3. Enable Gmail API:
   - Search for "Gmail API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Desktop app"
   - Download the JSON file
5. Link the OAuth credentials to your GAS project:
   - In GAS: Project Settings → Add Script Properties
   - Add credentials from downloaded JSON

---

### Step 1.5: Setup Netlify

**What to do:**
1. Go to Netlify: https://app.netlify.com
2. Connect GitHub repository:
   - Click "New site from Git"
   - Select GitHub
   - Choose `sawasdee-cup-2026` repo
   - Build command: `npm run build` (or leave blank if static)
   - Publish directory: `frontend/public`
3. Deploy site
4. Get your Netlify URL (e.g., `https://sawasdee-cup-2026.netlify.app`)
5. Update `CONFIG.FRONTEND_URL` in GAS config

---

## PHASE 2: Build Backend (Google Apps Script)

### Step 2.1: Create Database Module

Create `backend/src/database.gs`:

```javascript
/**
 * Database operations for registration system
 */

class Database {
  constructor() {
    this.ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  }
  
  /**
   * Get a sheet by name
   */
  getSheet(sheetName) {
    return this.ss.getSheetByName(sheetName) || 
           this.ss.insertSheet(sheetName);
  }
  
  /**
   * Add registration record
   */
  addRegistration(data) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.registrations);
    const row = [
      new Date().toISOString(),  // Timestamp
      data.tagID,
      data.firstName,
      data.lastName,
      data.idNumber,
      data.dob,
      data.gender,
      data.tshirt,
      data.email,
      data.phone,
      data.team,
      data.category1,
      data.category2,
      data.fee,
      'Pending',  // Status
      ''          // Notes
    ];
    
    sheet.appendRow(row);
    return { success: true, rowIndex: sheet.getLastRow() };
  }
  
  /**
   * Get all registrations
   */
  getAllRegistrations() {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.registrations);
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    return data.slice(1).map((row, index) => ({
      timestamp: row[0],
      tagID: row[1],
      firstName: row[2],
      lastName: row[3],
      email: row[8],
      status: row[14],
      rowIndex: index + 2
    }));
  }
  
  /**
   * Find registration by email
   */
  findByEmail(email) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.registrations);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][8] === email) {  // Column I: Email
        return data[i];
      }
    }
    return null;
  }
  
  /**
   * Find registration by Tag ID
   */
  findByTagID(tagID) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.registrations);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === tagID) {  // Column B: Tag_ID
        return data[i];
      }
    }
    return null;
  }
  
  /**
   * Update registration status
   */
  updateStatus(tagID, status) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.registrations);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === tagID) {
        sheet.getRange(i + 1, 15).setValue(status);  // Column O: Status
        return true;
      }
    }
    return false;
  }
  
  /**
   * Get all categories
   */
  getCategories() {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.categories);
    const data = sheet.getDataRange().getValues();
    
    return data.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      division: row[2],
      ageGroup: row[3],
      gender: row[4],
      minAge: row[5],
      maxAge: row[6],
      fee: row[7]
    }));
  }
  
  /**
   * Log email
   */
  logEmail(tagID, email, emailType, status, messageID) {
    const sheet = this.getSheet(CONFIG.SHEET_NAMES.emailLog);
    sheet.appendRow([
      new Date().toISOString(),  // Timestamp
      tagID,
      email,
      emailType,
      status,
      messageID,
      new Date().toISOString()   // Sent_At
    ]);
  }
}

// Create global instance
const db = new Database();
```

---

### Step 2.2: Create Validation Module

Create `backend/src/validation.gs`:

```javascript
/**
 * Validation logic for registration
 */

class Validator {
  /**
   * Validate registration data
   */
  static validateRegistration(data) {
    const errors = [];
    
    // Check required fields
    if (!data.firstName) errors.push('First name is required');
    if (!data.lastName) errors.push('Last name is required');
    if (!data.email) errors.push('Email is required');
    if (!data.dob) errors.push('Date of birth is required');
    
    // Validate email format
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    // Check email not already registered
    const existing = db.findByEmail(data.email);
    if (existing) {
      errors.push('This email is already registered');
    }
    
    // Validate age
    const age = this.calculateAge(data.dob);
    if (age < 15 || age > 120) {
      errors.push('Invalid age (must be between 15-120)');
    }
    
    // Check categories
    if (!data.category1) {
      errors.push('At least one category is required');
    }
    
    if (data.category1 && data.category2 && data.category1 === data.category2) {
      errors.push('Cannot select the same category twice');
    }
    
    if (data.category1 && data.category2 && !data.category1 && !data.category2) {
      // Both selected
      const cat1 = db.getCategories().find(c => c.name === data.category1);
      const cat2 = db.getCategories().find(c => c.name === data.category2);
      
      // Check eligibility
      if (cat1 && !this.isEligible(data.dob, cat1)) {
        errors.push(`You are not eligible for category: ${data.category1}`);
      }
      
      if (cat2 && !this.isEligible(data.dob, cat2)) {
        errors.push(`You are not eligible for category: ${data.category2}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Calculate age from DOB
   */
  static calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Check if person is eligible for category
   */
  static isEligible(dob, category) {
    const age = this.calculateAge(dob);
    return age >= category.minAge && age <= category.maxAge;
  }
}
```

---

### Step 2.3: Create Tag ID Generator

Create `backend/src/tagGenerator.gs`:

```javascript
/**
 * Generate unique Tag IDs
 */

class TagIDGenerator {
  /**
   * Generate new Tag ID
   */
  static generate() {
    const registrations = db.getAllRegistrations();
    const sequence = (registrations.length + 1).toString().padStart(3, '0');
    const random = this.generateRandomString(6);
    
    return `SC2026-${sequence}-${random}`;
  }
  
  /**
   * Generate random alphanumeric string
   */
  static generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }
  
  /**
   * Verify Tag ID format
   */
  static isValid(tagID) {
    const pattern = /^SC2026-\d{3}-[A-Z0-9]{6}$/;
    return pattern.test(tagID);
  }
}
```

---

### Step 2.4: Create Email Service

Create `backend/src/emailService.gs`:

```javascript
/**
 * Email service for sending confirmations
 */

class EmailService {
  /**
   * Send registration confirmation email
   */
  static sendConfirmation(registration) {
    const emailTemplate = this.getConfirmationTemplate(registration);
    
    try {
      GmailApp.sendEmail(
        registration.email,
        emailTemplate.subject,
        emailTemplate.body,
        {
          from: CONFIG.EMAIL_FROM,
          htmlBody: emailTemplate.htmlBody
        }
      );
      
      // Log email
      db.logEmail(
        registration.tagID,
        registration.email,
        'Confirmation',
        'Sent',
        'manual'
      );
      
      return { success: true };
    } catch (error) {
      Logger.log('Email send error: ' + error);
      db.logEmail(
        registration.tagID,
        registration.email,
        'Confirmation',
        'Failed',
        error.toString()
      );
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Get confirmation email template
   */
  static getConfirmationTemplate(reg) {
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2>Thank you for registering!</h2>
        
        <p>Dear ${reg.firstName},</p>
        
        <p>Your registration for <strong>${CONFIG.TOURNAMENT.name}</strong> 
        has been received.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #2196F3;">
          <h3 style="margin-top: 0;">Registration Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Tag ID:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace; font-weight: bold;">${reg.tagID}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reg.firstName} ${reg.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Categories:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${reg.category1}${reg.category2 ? ', ' + reg.category2 : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Registration Fee:</strong></td>
              <td style="padding: 8px; font-weight: bold;">${reg.fee.toLocaleString('th-TH')} THB</td>
            </tr>
          </table>
        </div>
        
        <h3>Payment Instructions</h3>
        <p>Please transfer the fee to:</p>
        <ul>
          <li><strong>Bank:</strong> Bangkok Bank</li>
          <li><strong>Account:</strong> Sawasdee Cup 2026</li>
          <li><strong>Account No:</strong> XXXX XXXX XXXX</li>
        </ul>
        
        <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
          <strong>⚠️ IMPORTANT:</strong> Please use your Tag ID as the reference/note in the bank transfer.
        </div>
        
        <p>After payment, please:</p>
        <ol>
          <li>Take a screenshot of the payment receipt</li>
          <li>Email it to: <strong>${CONFIG.EMAIL_ADMIN}</strong></li>
          <li>In the subject line, include: <strong>[${reg.tagID}]</strong></li>
        </ol>
        
        <p>Thank you!</p>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p><strong>Tournament Information:</strong></p>
          <p>Dates: ${CONFIG.TOURNAMENT.dates}<br>
          Venue: ${CONFIG.TOURNAMENT.venue}</p>
        </footer>
      </div>
    `;
    
    return {
      subject: `[${CONFIG.TOURNAMENT.name}] Registration Confirmation - Tag ID: ${reg.tagID}`,
      body: 'See HTML version',
      htmlBody: htmlBody
    };
  }
  
  /**
   * Send payment confirmation email (from admin)
   */
  static sendPaymentConfirmation(tagID) {
    const registration = db.findByTagID(tagID);
    if (!registration) return { success: false, error: 'Registration not found' };
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #4CAF50;">✓ Payment Confirmed!</h2>
        
        <p>Dear ${registration[2]}, (${registration[3]})</p>
        
        <p>Your payment has been verified and your registration is now confirmed.</p>
        
        <div style="background: #e8f5e9; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <h3 style="margin-top: 0; color: #2e7d32;">Confirmation Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #c8e6c9;"><strong>Tag ID:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #c8e6c9; font-family: monospace; font-weight: bold;">${tagID}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #c8e6c9;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #c8e6c9;">${registration[13].toLocaleString('th-TH')} THB</td>
            </tr>
            <tr>
              <td style="padding: 8px;"><strong>Status:</strong></td>
              <td style="padding: 8px; color: #4CAF50; font-weight: bold;">✓ CONFIRMED</td>
            </tr>
          </table>
        </div>
        
        <p>Good luck in the tournament!</p>
        
        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
          <p>${CONFIG.TOURNAMENT.name}</p>
          <p>${CONFIG.TOURNAMENT.dates}<br>${CONFIG.TOURNAMENT.venue}</p>
        </footer>
      </div>
    `;
    
    try {
      GmailApp.sendEmail(
        registration[8],  // Email
        `[${CONFIG.TOURNAMENT.name}] Payment Confirmed - ${tagID}`,
        'See HTML version',
        { htmlBody: htmlBody }
      );
      
      db.logEmail(tagID, registration[8], 'Payment_Confirmation', 'Sent', 'admin');
      return { success: true };
    } catch (error) {
      Logger.log('Error sending payment confirmation: ' + error);
      return { success: false, error: error.toString() };
    }
  }
}
```

---

### Step 2.5: Create Registration Service

Create `backend/src/registration.gs`:

```javascript
/**
 * Registration service - Main business logic
 */

class RegistrationService {
  /**
   * Process new registration
   */
  static register(data) {
    // Validate
    const validation = Validator.validateRegistration(data);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    // Generate Tag ID
    const tagID = TagIDGenerator.generate();
    
    // Calculate total fee
    const categories = db.getCategories();
    const cat1 = categories.find(c => c.name === data.category1);
    const cat2 = data.category2 ? categories.find(c => c.name === data.category2) : null;
    const totalFee = (cat1?.fee || 0) + (cat2?.fee || 0);
    
    // Prepare registration record
    const registration = {
      tagID: tagID,
      firstName: data.firstName,
      lastName: data.lastName,
      idNumber: data.idNumber,
      dob: data.dob,
      gender: data.gender,
      tshirt: data.tshirt,
      email: data.email,
      phone: data.phone,
      team: data.team || '',
      category1: data.category1,
      category2: data.category2 || '',
      fee: totalFee
    };
    
    // Save to database
    const dbResult = db.addRegistration(registration);
    if (!dbResult.success) {
      return {
        success: false,
        error: 'Failed to save registration'
      };
    }
    
    // Send confirmation email
    const emailResult = EmailService.sendConfirmation(registration);
    if (!emailResult.success) {
      Logger.log('Warning: Email failed but registration saved: ' + emailResult.error);
    }
    
    return {
      success: true,
      tagID: tagID,
      fee: totalFee,
      message: 'Registration successful',
      redirectUrl: `${CONFIG.FRONTEND_URL}/confirmation.html?tag=${tagID}`
    };
  }
}
```

---

### Step 2.6: Create API Server

Create `backend/src/server.gs`:

```javascript
/**
 * HTTP server - API endpoints
 */

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let response = {};
    
    switch (action) {
      case 'register':
        response = RegistrationService.register(params.data);
        break;
        
      case 'getCategories':
        response = { success: true, categories: db.getCategories() };
        break;
        
      case 'getRegistration':
        const reg = db.findByTagID(params.tagID);
        response = reg ? 
          { success: true, registration: reg } :
          { success: false, error: 'Not found' };
        break;
        
      case 'confirmPayment':
        // Admin-only action - should add auth
        const updated = db.updateStatus(params.tagID, 'Payment_Confirmed');
        if (updated) {
          EmailService.sendPaymentConfirmation(params.tagID);
          response = { success: true, message: 'Payment confirmed' };
        } else {
          response = { success: false, error: 'Tag ID not found' };
        }
        break;
        
      default:
        response = { success: false, error: 'Unknown action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Server error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## PHASE 3: Build Frontend (HTML/CSS/JS)

### Step 3.1: Create Main Registration Form

Create `frontend/public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sawasdee Cup 2026 - Registration</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>🏸 Sawasdee Cup 2026</h1>
      <p>Pattaya International Badminton Championship</p>
    </header>
    
    <main>
      <form id="registrationForm">
        <!-- Personal Information Section -->
        <fieldset>
          <legend>Personal Information</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input type="text" id="firstName" name="firstName" required>
              <span class="error-message"></span>
            </div>
            
            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input type="text" id="lastName" name="lastName" required>
              <span class="error-message"></span>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="idNumber">ID Number (Passport/National ID) *</label>
              <input type="text" id="idNumber" name="idNumber" required>
              <span class="error-message"></span>
            </div>
            
            <div class="form-group">
              <label for="dob">Date of Birth *</label>
              <input type="date" id="dob" name="dob" required>
              <span class="error-message"></span>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="gender">Gender *</label>
              <select id="gender" name="gender" required>
                <option value="">-- Select --</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
              <span class="error-message"></span>
            </div>
            
            <div class="form-group">
              <label for="tshirt">T-Shirt Size *</label>
              <select id="tshirt" name="tshirt" required>
                <option value="">-- Select --</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
              <span class="error-message"></span>
            </div>
          </div>
        </fieldset>
        
        <!-- Contact Information Section -->
        <fieldset>
          <legend>Contact Information</legend>
          
          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input type="email" id="email" name="email" required>
              <span class="error-message"></span>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number *</label>
              <input type="tel" id="phone" name="phone" placeholder="+66-8-xxxx-xxxx" required>
              <span class="error-message"></span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="team">Team Name (Optional)</label>
            <input type="text" id="team" name="team">
          </div>
        </fieldset>
        
        <!-- Categories Section -->
        <fieldset>
          <legend>Event Categories</legend>
          <p class="note">Select 1-2 categories. You cannot register for the same event in different age groups.</p>
          
          <div class="form-group">
            <label for="category1">Category 1 *</label>
            <select id="category1" name="category1" required>
              <option value="">-- Select Category --</option>
            </select>
            <span class="error-message"></span>
          </div>
          
          <div class="form-group">
            <label for="category2">Category 2 (Optional)</label>
            <select id="category2" name="category2">
              <option value="">-- Select Category --</option>
            </select>
            <span class="error-message"></span>
          </div>
          
          <div class="category-info">
            <p id="categoryDetails"></p>
          </div>
        </fieldset>
        
        <!-- Summary Section -->
        <fieldset class="summary">
          <legend>Registration Summary</legend>
          <div class="summary-content">
            <div class="summary-row">
              <span>Registration Fee:</span>
              <span id="totalFee" class="fee-amount">0 THB</span>
            </div>
            <div class="note warning">
              * Payment instructions will be sent to your email after registration
            </div>
          </div>
        </fieldset>
        
        <!-- Terms & Conditions -->
        <fieldset>
          <legend>Agreement</legend>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="agree" name="agree" required>
            <label for="agree">I agree to the tournament rules and regulations *</label>
            <span class="error-message"></span>
          </div>
          
          <div class="form-group checkbox">
            <input type="checkbox" id="health" name="health" required>
            <label for="health">I confirm I am in good health and fit to compete *</label>
            <span class="error-message"></span>
          </div>
        </fieldset>
        
        <!-- Submit Button -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" id="submitBtn">
            Submit Registration
          </button>
          <button type="reset" class="btn btn-secondary">Clear Form</button>
        </div>
        
        <div id="loading" class="loading" style="display: none;">
          <div class="spinner"></div>
          <p>Processing your registration...</p>
        </div>
      </form>
    </main>
    
    <footer>
      <p>Tournament Dates: 27-29 November 2026 | Venue: Eastern National Sports Center, Pattaya</p>
      <p>Questions? Email: info@sawasdee-cup.com | Payment: finance.jadesport@gmail.com</p>
    </footer>
  </div>
  
  <script src="js/constants.js"></script>
  <script src="js/validation.js"></script>
  <script src="js/form-handler.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

---

### Step 3.2: Create Styling

Create `frontend/public/css/style.css`:

```css
/* ==========================================
   Sawasdee Cup 2026 - Registration Form CSS
   ========================================== */

:root {
  --primary-color: #2196F3;
  --primary-dark: #1976D2;
  --success-color: #4CAF50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  --light-bg: #f5f5f5;
  --border-color: #ddd;
  --text-color: #333;
  --text-light: #666;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Header */
header {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}

header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Main Content */
main {
  padding: 40px;
}

/* Form Styling */
form {
  display: grid;
  gap: 30px;
}

fieldset {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 25px;
  background: var(--light-bg);
}

fieldset.summary {
  background: #e3f2fd;
  border-color: var(--primary-color);
}

legend {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
  padding: 0 10px;
  margin: -15px 0 15px -10px;
}

/* Form Groups */
.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}

.form-group input:invalid:not(:placeholder-shown),
.form-group select:invalid {
  border-color: var(--danger-color);
}

/* Checkboxes */
.form-group.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
}

.form-group.checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-top: 3px;
  cursor: pointer;
  flex-shrink: 0;
}

.form-group.checkbox label {
  margin: 0;
  cursor: pointer;
  user-select: none;
}

/* Error Messages */
.error-message {
  color: var(--danger-color);
  font-size: 0.9rem;
  margin-top: 5px;
  display: block;
  min-height: 1.2rem;
}

/* Notes and Warnings */
.note {
  font-size: 0.95rem;
  color: var(--text-light);
  margin-bottom: 15px;
  padding: 10px;
  background: #fff3cd;
  border-left: 4px solid var(--warning-color);
  padding-left: 15px;
}

.note.warning {
  margin-top: 15px;
  margin-bottom: 0;
}

/* Category Details */
.category-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border-left: 4px solid var(--primary-color);
}

/* Summary */
.summary-content {
  background: white;
  padding: 15px;
  border-radius: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-row:last-child {
  border-bottom: none;
}

.fee-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--success-color);
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  min-width: 150px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(33, 150, 243, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--light-bg);
  color: var(--text-color);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--border-color);
}

/* Loading */
.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--light-bg);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer */
footer {
  background: var(--light-bg);
  padding: 20px 40px;
  text-align: center;
  border-top: 1px solid var(--border-color);
  color: var(--text-light);
  font-size: 0.95rem;
}

footer p {
  margin-bottom: 10px;
}

footer p:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    flex: none;
  }
  
  header h1 {
    font-size: 1.8rem;
  }
  
  main {
    padding: 20px;
  }
  
  fieldset {
    padding: 15px;
  }
}
```

---

### Step 3.3: Create JavaScript Files

Create `frontend/public/js/constants.js`:

```javascript
// API Configuration
const API_CONFIG = {
  // Change this to your Google Apps Script deployment URL
  GAS_URL: 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercache',
  FRONTEND_URL: 'https://sawasdee-cup-2026.netlify.app'
};

// Categories (will be fetched from backend)
let CATEGORIES = [];

// Category cache
const CATEGORY_CACHE = {
  fetched: false,
  data: []
};
```

Create `frontend/public/js/validation.js`:

```javascript
/**
 * Client-side validation
 */

class FormValidator {
  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  static calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  }
  
  static validateForm(formData) {
    const errors = {};
    
    // First Name
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last Name
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    // DOB
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const age = this.calculateAge(formData.dob);
      if (age < 15 || age > 120) {
        errors.dob = 'Age must be between 15-120 years';
      }
    }
    
    // Gender
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    // T-Shirt
    if (!formData.tshirt) {
      errors.tshirt = 'T-shirt size is required';
    }
    
    // Phone
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    }
    
    // Categories
    if (!formData.category1) {
      errors.category1 = 'At least one category is required';
    }
    
    if (formData.category1 && formData.category2 && formData.category1 === formData.category2) {
      errors.category2 = 'Cannot select the same category twice';
    }
    
    // Agreements
    if (!formData.agree) {
      errors.agree = 'You must agree to the tournament rules';
    }
    
    if (!formData.health) {
      errors.health = 'You must confirm your health status';
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors: errors
    };
  }
}
```

Create `frontend/public/js/form-handler.js`:

```javascript
/**
 * Form submission handler
 */

class FormHandler {
  constructor() {
    this.form = document.getElementById('registrationForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.loadingDiv = document.getElementById('loading');
    this.category1Select = document.getElementById('category1');
    this.category2Select = document.getElementById('category2');
    this.categoryDetails = document.getElementById('categoryDetails');
    this.totalFeeSpan = document.getElementById('totalFee');
    
    this.init();
  }
  
  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.category1Select.addEventListener('change', () => this.updateFee());
    this.category2Select.addEventListener('change', () => this.updateFee());
    this.form.addEventListener('input', (e) => this.clearError(e.target));
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this.form);
    const data = {
      firstName: formData.get('firstName').trim(),
      lastName: formData.get('lastName').trim(),
      idNumber: formData.get('idNumber').trim(),
      dob: formData.get('dob'),
      gender: formData.get('gender'),
      tshirt: formData.get('tshirt'),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      team: formData.get('team').trim() || '',
      category1: formData.get('category1'),
      category2: formData.get('category2') || '',
      agree: formData.get('agree') === 'on',
      health: formData.get('health') === 'on'
    };
    
    // Validate
    const validation = FormValidator.validateForm(data);
    if (!validation.valid) {
      this.displayErrors(validation.errors);
      return;
    }
    
    // Submit
    await this.submit(data);
  }
  
  async submit(data) {
    this.submitBtn.disabled = true;
    this.loadingDiv.style.display = 'block';
    
    try {
      const response = await fetch(API_CONFIG.GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'register',
          data: data
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to confirmation page
        window.location.href = result.redirectUrl;
      } else {
        alert('Registration failed:\n\n' + (result.error || result.errors?.join('\n')));
        this.submitBtn.disabled = false;
        this.loadingDiv.style.display = 'none';
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred. Please try again.');
      this.submitBtn.disabled = false;
      this.loadingDiv.style.display = 'none';
    }
  }
  
  updateFee() {
    const cat1 = this.category1Select.value;
    const cat2 = this.category2Select.value;
    
    let totalFee = 0;
    let details = '';
    
    if (cat1) {
      const category = CATEGORIES.find(c => c.name === cat1);
      if (category) {
        totalFee += category.fee;
        details += `${category.name}: ${category.fee.toLocaleString('th-TH')} THB\n`;
      }
    }
    
    if (cat2 && cat2 !== cat1) {
      const category = CATEGORIES.find(c => c.name === cat2);
      if (category) {
        totalFee += category.fee;
        details += `${category.name}: ${category.fee.toLocaleString('th-TH')} THB\n`;
      }
    }
    
    this.totalFeeSpan.textContent = `${totalFee.toLocaleString('th-TH')} THB`;
    this.categoryDetails.textContent = details || 'Select a category';
  }
  
  displayErrors(errors) {
    // Clear all previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Display new errors
    Object.entries(errors).forEach(([fieldName, errorMessage]) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const errorEl = field.parentElement.querySelector('.error-message');
        if (errorEl) {
          errorEl.textContent = errorMessage;
        }
      }
    });
  }
  
  clearError(field) {
    const errorEl = field.parentElement.querySelector('.error-message');
    if (errorEl) {
      errorEl.textContent = '';
    }
  }
}
```

Create `frontend/public/js/app.js`:

```javascript
/**
 * Main application logic
 */

async function initializeApp() {
  // Load categories from backend
  try {
    const response = await fetch(API_CONFIG.GAS_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'getCategories' })
    });
    
    const result = await response.json();
    
    if (result.success) {
      CATEGORIES = result.categories;
      populateCategories();
    } else {
      console.error('Failed to load categories:', result.error);
      alert('Failed to load categories. Please refresh the page.');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    alert('Error loading form data. Please refresh the page.');
  }
}

function populateCategories() {
  const cat1Select = document.getElementById('category1');
  const cat2Select = document.getElementById('category2');
  
  // Group categories by division
  const divisionGroups = {};
  CATEGORIES.forEach(cat => {
    if (!divisionGroups[cat.division]) {
      divisionGroups[cat.division] = [];
    }
    divisionGroups[cat.division].push(cat);
  });
  
  // Populate dropdowns
  [cat1Select, cat2Select].forEach(select => {
    let html = '<option value="">-- Select Category --</option>';
    
    Object.entries(divisionGroups).forEach(([division, categories]) => {
      html += `<optgroup label="${division}">`;
      categories.forEach(cat => {
        html += `<option value="${cat.name}" data-fee="${cat.fee}">${cat.name}</option>`;
      });
      html += '</optgroup>';
    });
    
    select.innerHTML = html;
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  new FormHandler();
});
```

---

### Step 3.4: Create Confirmation Page

Create `frontend/public/confirmation.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmed - Sawasdee Cup 2026</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    .success-container {
      background: #e8f5e9;
      border: 2px solid #4CAF50;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      margin: 40px 0;
    }
    
    .success-icon {
      font-size: 4rem;
      color: #4CAF50;
      margin-bottom: 20px;
    }
    
    .success-container h2 {
      color: #2e7d32;
      margin-bottom: 15px;
    }
    
    .tag-id-box {
      background: white;
      border: 2px dashed #4CAF50;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    
    .tag-id {
      font-size: 1.8rem;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #2e7d32;
      letter-spacing: 3px;
    }
    
    .next-steps {
      background: #fff3cd;
      border-left: 4px solid #ff9800;
      padding: 20px;
      margin: 20px 0;
      border-radius: 6px;
      text-align: left;
    }
    
    .next-steps h3 {
      color: #ff6f00;
      margin-bottom: 15px;
    }
    
    .next-steps ol {
      margin-left: 20px;
      line-height: 1.8;
    }
    
    .next-steps li {
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏸 Sawasdee Cup 2026</h1>
      <p>Pattaya International Badminton Championship</p>
    </header>
    
    <main>
      <div class="success-container">
        <div class="success-icon">✓</div>
        <h2>Registration Successful!</h2>
        <p>Thank you for registering for Sawasdee Cup 2026!</p>
        
        <div class="tag-id-box">
          <p style="color: #666; margin-bottom: 10px;">Your Tag ID:</p>
          <div class="tag-id" id="tagID">SC2026-001-ABC123</div>
        </div>
        
        <p style="color: #666; margin-bottom: 20px;">
          A confirmation email has been sent to your email address.
        </p>
      </div>
      
      <div class="next-steps">
        <h3>📋 Next Steps:</h3>
        <ol>
          <li>
            <strong>Check your email</strong> for registration confirmation and fee details
          </li>
          <li>
            <strong>Transfer the registration fee</strong> to the provided bank account
            <br><span style="font-size: 0.9rem; color: #666;">Use your Tag ID as the reference/note</span>
          </li>
          <li>
            <strong>Take a screenshot</strong> of the payment receipt
          </li>
          <li>
            <strong>Email the receipt</strong> to: <strong>finance.jadesport@gmail.com</strong>
            <br><span style="font-size: 0.9rem; color: #666;">Subject: [Your Tag ID]</span>
          </li>
          <li>
            <strong>Wait for confirmation</strong> from the admin
            <br><span style="font-size: 0.9rem; color: #666;">You'll receive another email when payment is verified</span>
          </li>
        </ol>
      </div>
      
      <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0; border-radius: 6px; text-align: left;">
        <p style="margin-bottom: 10px;"><strong>📌 Important Notes:</strong></p>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li>Keep your Tag ID safe - you'll need it for payment and check-in</li>
          <li>Tournament dates: 27-29 November 2026</li>
          <li>Venue: Eastern National Sports Center, Pattaya</li>
          <li>Questions? Email: info@sawasdee-cup.com</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 40px;">
        <a href="/" class="btn btn-primary" style="display: inline-block; text-decoration: none;">
          Back to Home
        </a>
      </div>
    </main>
    
    <footer>
      <p>Tournament Dates: 27-29 November 2026 | Venue: Eastern National Sports Center, Pattaya</p>
      <p>Questions? Email: info@sawasdee-cup.com | Payment: finance.jadesport@gmail.com</p>
    </footer>
  </div>
  
  <script>
    // Get Tag ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagID = urlParams.get('tag') || 'SC2026-001-ABC123';
    document.getElementById('tagID').textContent = tagID;
  </script>
</body>
</html>
```

---

## PHASE 4: Deployment

### Step 4.1: Deploy Google Apps Script

```bash
# Install clasp (if not already)
npm install -g @google/clasp

# Login to Google
clasp login

# Clone GAS project (from browser first: get Script ID from Project Settings)
clasp clone {YOUR_GAS_SCRIPT_ID}

# Push code
clasp push

# Deploy (via web UI: Deploy → New deployment → Select Type → Web app)
# Set "Execute as" to your account
# Set "Who has access" to "Anyone"
# Get the deployment URL
```

**Update `frontend/public/js/constants.js`:**
```javascript
const API_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/usercache',
  FRONTEND_URL: 'https://sawasdee-cup-2026.netlify.app'
};
```

---

### Step 4.2: Deploy Frontend to Netlify

```bash
# Option 1: Via Git (automatic)
# Just push to main branch - Netlify auto-deploys

# Option 2: Manual deployment
npm run build  # If you have build step
netlify deploy --prod --dir=frontend/public
```

---

## PHASE 5: Testing Checklist

```
[ ] Form submission works
[ ] Validation works (client & server)
[ ] Tag ID generated correctly
[ ] Email sent with confirmation
[ ] Categories populate correctly
[ ] Fee calculation works
[ ] Payment status update works
[ ] Confirmation page displays tag ID
[ ] Error handling works
[ ] Mobile responsive
[ ] CORS working
[ ] Database syncing correct
```

---

## Next Steps

1. ✅ Complete all implementation steps above
2. ✅ Test thoroughly with test data
3. ✅ Setup admin dashboard for payment verification
4. ✅ Create user guide documentation
5. ✅ Launch and monitor

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-13
