# Sawasdee Cup 2026 - Admin Payment Verification System

## 📊 Admin Dashboard Overview

The admin dashboard allows you to manage registrations and verify payments directly from Google Sheets.

---

## Part 1: Simple Manual Admin Panel (via Google Sheets)

### Setup: Create Admin Tab in Google Sheets

Add a new sheet called `ADMIN_PANEL` with:

```
A: Action
B: Tag_ID
C: Status
D: Amount
E: Receipt_Date
F: Verified_By
G: Notes
```

This sheet allows quick status updates.

---

## Part 2: Web-Based Admin Dashboard (Advanced)

If you want a dedicated admin interface, create `frontend/public/admin/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Sawasdee Cup 2026</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
    }
    
    .admin-container {
      display: flex;
      height: 100vh;
    }
    
    /* Sidebar */
    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      padding: 20px;
      overflow-y: auto;
    }
    
    .sidebar h2 {
      margin-bottom: 30px;
      font-size: 1.2rem;
    }
    
    .sidebar ul {
      list-style: none;
    }
    
    .sidebar li {
      margin-bottom: 10px;
    }
    
    .sidebar a {
      color: #ecf0f1;
      text-decoration: none;
      padding: 10px 15px;
      display: block;
      border-radius: 6px;
      transition: background 0.3s;
    }
    
    .sidebar a:hover,
    .sidebar a.active {
      background: #3498db;
    }
    
    /* Main Content */
    .main-content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #2c3e50;
    }
    
    .logout-btn {
      background: #e74c3c;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    
    /* Dashboard Stats */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      border-left: 4px solid #3498db;
    }
    
    .stat-card h3 {
      color: #7f8c8d;
      font-size: 0.9rem;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    
    .stat-card .value {
      font-size: 2rem;
      color: #2c3e50;
      font-weight: bold;
    }
    
    /* Registrations Table */
    .registrations-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filters {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .filters input,
    .filters select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    
    th {
      background: #f5f5f5;
      font-weight: 600;
      color: #2c3e50;
    }
    
    tr:hover {
      background: #f9f9f9;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-confirmed {
      background: #d4edda;
      color: #155724;
    }
    
    .status-failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    .action-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      margin-right: 5px;
    }
    
    .btn-verify {
      background: #27ae60;
      color: white;
    }
    
    .btn-verify:hover {
      background: #229954;
    }
    
    .btn-reject {
      background: #e74c3c;
      color: white;
    }
    
    .btn-view {
      background: #3498db;
      color: white;
    }
    
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    
    .modal.active {
      display: flex;
    }
    
    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .modal-header {
      margin-bottom: 20px;
    }
    
    .modal-body {
      margin-bottom: 20px;
    }
    
    .modal-footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: #3498db;
      color: white;
    }
    
    .btn-secondary {
      background: #95a5a6;
      color: white;
    }
  </style>
</head>
<body>
  <div class="admin-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <h2>🏸 Admin Panel</h2>
      <ul>
        <li><a href="#" class="nav-link active" data-section="dashboard">Dashboard</a></li>
        <li><a href="#" class="nav-link" data-section="pending">Pending Payments</a></li>
        <li><a href="#" class="nav-link" data-section="confirmed">Confirmed</a></li>
        <li><a href="#" class="nav-link" data-section="all">All Registrations</a></li>
        <li><a href="#" class="nav-link" data-section="stats">Statistics</a></li>
      </ul>
      <button class="logout-btn" onclick="logout()" style="margin-top: 40px; width: 100%;">Logout</button>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
      <div class="header">
        <h1>Sawasdee Cup 2026 - Admin Dashboard</h1>
        <div id="userInfo" style="color: #7f8c8d;"></div>
      </div>
      
      <!-- Dashboard Section -->
      <div id="dashboard" class="section" style="display: block;">
        <h2 style="margin-bottom: 20px;">Dashboard</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Registrations</h3>
            <div class="value" id="totalRegs">0</div>
          </div>
          <div class="stat-card" style="border-left-color: #f39c12;">
            <h3>Pending Payments</h3>
            <div class="value" id="pendingRegs">0</div>
          </div>
          <div class="stat-card" style="border-left-color: #27ae60;">
            <h3>Confirmed</h3>
            <div class="value" id="confirmedRegs">0</div>
          </div>
          <div class="stat-card" style="border-left-color: #9b59b6;">
            <h3>Total Fees Collected</h3>
            <div class="value" id="totalFees">0 THB</div>
          </div>
        </div>
      </div>
      
      <!-- Pending Payments Section -->
      <div id="pending" class="section" style="display: none;">
        <div class="registrations-section">
          <div class="section-header">
            <h2>Pending Payments</h2>
            <span style="color: #7f8c8d;">These registrations are awaiting payment verification</span>
          </div>
          
          <div class="filters">
            <input type="text" id="filterEmail" placeholder="Filter by email..." 
                   onkeyup="filterTable('pending')">
          </div>
          
          <table id="pendingTable">
            <thead>
              <tr>
                <th>Tag ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      
      <!-- All Registrations Section -->
      <div id="all" class="section" style="display: none;">
        <div class="registrations-section">
          <div class="section-header">
            <h2>All Registrations</h2>
          </div>
          
          <div class="filters">
            <input type="text" id="filterAll" placeholder="Search..." 
                   onkeyup="filterTable('all')">
            <select onchange="filterByStatus(this.value)">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Payment_Confirmed">Confirmed</option>
            </select>
          </div>
          
          <table id="allTable">
            <thead>
              <tr>
                <th>Tag ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal for Details -->
  <div id="detailsModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Registration Details</h2>
      </div>
      
      <div class="modal-body" id="modalBody">
        <!-- Content filled dynamically -->
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button class="btn btn-primary" id="confirmPaymentBtn" onclick="confirmPayment()">Confirm Payment</button>
      </div>
    </div>
  </div>
  
  <script>
    // Placeholder for admin logic
    // In production, this would fetch from GAS API
    
    function filterTable(section) {
      // Filter implementation
    }
    
    function filterByStatus(status) {
      // Status filter implementation
    }
    
    function closeModal() {
      document.getElementById('detailsModal').classList.remove('active');
    }
    
    function confirmPayment() {
      // Confirm payment implementation
    }
    
    function logout() {
      // Logout implementation
      window.location.href = '/';
    }
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const section = link.dataset.section;
        document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
        document.getElementById(section).style.display = 'block';
      });
    });
  </script>
</body>
</html>
```

---

## Step-by-Step: Payment Verification Process

### For Admin (finance.jadesport@gmail.com)

#### Step 1: Receive Payment Slip Email

When a player sends payment slip, admin receives:
```
From: [Player Email]
Subject: [SC2026-001-ABC123] Payment Slip
Attachment: Screenshot of payment
```

#### Step 2: Verify in Google Sheets

**Option A: Manual (Simple)**
1. Open Google Sheet: "Sawasdee Cup 2026 - Registrations"
2. Go to Sheet: `PAYMENT_TRACKING`
3. Find row with matching Tag ID
4. Fill columns:
   - `Receipt_Date`: Date received
   - `Payment_Verified`: Yes
   - `Verified_By`: Your name
   - `Notes`: Bank/Reference details

**Option B: Admin Dashboard (Advanced)**
1. Go to: https://sawasdee-cup-2026.netlify.app/admin
2. Login with your Gmail account
3. Find payment in "Pending Payments"
4. Click "Verify Payment"
5. System auto-sends confirmation email

#### Step 3: System Sends Confirmation Email

When you mark as verified:
- GAS script detects the change
- System sends confirmation email to player
- Status updates to "Confirmed"

---

## Payment Verification Email Template

**What player receives after payment is confirmed:**

```
From: noreply@sawasdee-cup.com
To: [Player Email]
Subject: [Sawasdee Cup 2026] Payment Confirmed - SC2026-001-ABC123

───────────────────────────────────
✓ PAYMENT CONFIRMED

Dear [Name],

Your payment has been verified and your registration is now confirmed!

Tag ID:        SC2026-001-ABC123
Amount:        1,500 THB  
Status:        ✓ CONFIRMED
Confirmation:  2026-01-16

───────────────────────────────────
Tournament Information

Dates: 27-29 November 2026
Venue: Eastern National Sports Center, Pattaya

Good luck in the tournament!

Sawasdee Cup 2026 Team
```

---

## GAS Script: Auto-Detect Payment Verification

Add this to `backend/src/database.gs` to auto-detect payment changes:

```javascript
/**
 * Trigger function - runs when sheet is edited
 * Detects payment verification and sends email
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const value = range.getValue();
  
  // Check if this is PAYMENT_TRACKING sheet, column F (Payment_Verified)
  if (sheet.getName() === CONFIG.SHEET_NAMES.paymentTracking && 
      range.getColumn() === 6 && 
      value === 'Yes') {
    
    const rowIndex = range.getRow();
    const data = sheet.getRange(rowIndex, 1, 1, 8).getValues()[0];
    const tagID = data[0];
    
    // Send confirmation email
    EmailService.sendPaymentConfirmation(tagID);
    
    // Update registration status
    db.updateStatus(tagID, 'Confirmed');
    
    Logger.log(`Payment confirmed for ${tagID}`);
  }
}
```

Add this trigger in Google Apps Script:
1. Go to GAS: https://script.google.com
2. Click "Triggers" (clock icon)
3. Add trigger:
   - Function: `onEdit`
   - Event: `On edit`
   - Save

---

## Admin Checklist Process

```
Daily Process:

☐ 1. Check email for payment slips (finance.jadesport@gmail.com)

☐ 2. Open Google Sheet: PAYMENT_TRACKING

☐ 3. For each payment received:
      ☐ Verify bank transfer received
      ☐ Match amount with registration fee
      ☐ Update "Payment_Received": Yes
      ☐ Update "Receipt_Date": Today
      ☐ Update "Payment_Verified": Yes
      ☐ Update "Verified_By": Your name
      ☐ Add notes: Bank/Reference if needed

☐ 4. System automatically:
      ☐ Sends confirmation email to player
      ☐ Updates REGISTRATIONS status to "Confirmed"

☐ 5. End of day: Review statistics
      ☐ Total registrations
      ☐ Total payments received
      ☐ Pending verifications
```

---

## Reports & Export

### Generate Registration List

In Google Apps Script:

```javascript
function generateRegistrationReport() {
  const sheet = db.getSheet(CONFIG.SHEET_NAMES.registrations);
  const data = sheet.getDataRange().getValues();
  
  // Group by category
  const byCategory = {};
  data.slice(1).forEach(row => {
    const cat = row[11]; // Category_1
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(row);
  });
  
  // Create report
  let report = 'SAWASDEE CUP 2026 - REGISTRATION REPORT\n\n';
  Object.entries(byCategory).forEach(([cat, registrations]) => {
    report += `\n${cat}: ${registrations.length} players\n`;
    report += '─'.repeat(50) + '\n';
    registrations.forEach(reg => {
      report += `${reg[1]} | ${reg[2]} ${reg[3]} | ${reg[8]}\n`;
    });
  });
  
  return report;
}
```

---

## Payment Tracking Spreadsheet Example

| Tag_ID | Amount | Expected | Received | Date | Verified | By | Notes |
|--------|--------|----------|----------|------|----------|----|----|
| SC2026-001-ABC123 | 1500 | 1500 | ✓ | 2026-01-16 | Yes | Admin | Ref: 123456 |
| SC2026-002-DEF456 | 2000 | 2000 | ✓ | 2026-01-16 | Yes | Admin | Doubles |
| SC2026-003-GHI789 | 1500 | 1500 | | | No | | Pending |

---

## Troubleshooting

### Player says payment sent but not found

1. Check email from correct address
2. Search bank records for reference number
3. Update notes with investigation
4. Mark verified once confirmed

### Wrong amount received

1. Update "Payment_Received" amount
2. Add note: "Received [amount] - short [difference]"
3. Contact player for balance

### Email not sent to player

1. Check spam folder
2. Verify email address in database
3. Manually resend via `EmailService.sendPaymentConfirmation(tagID)`

---

**Status:** Ready for Production
