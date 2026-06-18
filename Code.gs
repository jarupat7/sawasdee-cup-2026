/**
 * SAWASDEE CUP 2026 - BACKEND (Master Release v1.3)
 * อัปเดตข้อมูลบัญชีโอนเงิน: FYC CLUB
 */

const CONFIG = {
  // ใส่ ID ของ Google Sheets (คัดลอกจาก URL ของชีตคุณ)
  SHEET_ID: "12ktjlyh9Mo6t1DFA8zVuuzL5YJe3bnnM3tj_3S7qDe4", // <<<<<<< เปลี่ยนเป็น ID ของชีตคุณตรงนี้
  SHEET_NAMES: {
    registrations: "REGISTRATIONS", 
    allData: "ALL DATA"             
  },
  TOURNAMENT_NAME: "Sawasdee Cup 2026"
};

/**
 * ฟังก์ชันสำหรับ Setup หัวตารางครั้งแรก
 */
function setupSheetHeaders() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  // 1. ตั้งค่า Tab: REGISTRATIONS
  let sheet1 = ss.getSheetByName(CONFIG.SHEET_NAMES.registrations);
  if (!sheet1) sheet1 = ss.insertSheet(CONFIG.SHEET_NAMES.registrations);

  const headers1 = [
    "Timestamp", "Tag_ID", "Status", "Total_Fee", 
    "Full_Name", "Nationality", "ID_Passport", 
    "Email", "Phone", "Gender", "Birth_Year", "T_Shirt",
    "Event_1_Name", "Event_1_Partners", 
    "Event_2_Name", "Event_2_Partners",
    "Team_Name", "Team_Manager_Email", "Team_Players", 
    "Notes"
  ];
  
  const headerRange1 = sheet1.getRange(1, 1, 1, headers1.length);
  headerRange1.setValues([headers1]);
  headerRange1.setFontWeight("bold").setBackground("#e3f2fd"); 
  sheet1.setFrozenRows(1); 

  // 2. ตั้งค่า Tab: ALL DATA
  let sheet2 = ss.getSheetByName(CONFIG.SHEET_NAMES.allData);
  if (!sheet2) sheet2 = ss.insertSheet(CONFIG.SHEET_NAMES.allData);

  const headers2 = [
    "Timestamp", "Tag_ID", "Status", "Event_Category", "Event_Name", "Team_Name",
    "P1_Name", "P1_Country", "P1_ID_Passport", "P1_Email", "P1_Phone", "P1_Gender", "P1_BirthYear", "P1_Age", "P1_TShirt",
    "P2_Name", "P2_Country", "P2_ID_Passport", "P2_Email", "P2_BirthYear", "P2_Age", "P2_TShirt",
    "P3_Name", "P3_Country", "P3_ID_Passport", "P3_Email", "P3_BirthYear", "P3_Age", "P3_TShirt",
    "Team_Manager_Email", "Team_Players_List"
  ];
  
  const headerRange2 = sheet2.getRange(1, 1, 1, headers2.length);
  headerRange2.setValues([headers2]);
  headerRange2.setFontWeight("bold").setBackground("#e8f5e9"); 
  sheet2.setFrozenRows(1); 

  Logger.log("✅ สร้างหัวตารางทั้ง 2 หน้าเรียบร้อยแล้ว!");
}

function setupPermissions() {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.registrations);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_NAMES.registrations);
  
  const userEmail = Session.getActiveUser().getEmail();
  if(userEmail) {
    GmailApp.sendEmail(userEmail, "Test Sawasdee Cup", "Backend connected successfully!");
    Logger.log("✅ ยืนยันสิทธิ์และส่งอีเมลทดสอบเรียบร้อยแล้ว!");
  }
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    if (params.action === 'register') {
      const result = processRegistration(params.data);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, error: 'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Sawasdee Cup 2026 Backend is running.");
}

function processRegistration(payload) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const randomChar = Math.random().toString(36).substring(2, 8).toUpperCase();
  const tagId = `SC2026-${sequence}-${randomChar}`;

  const p = payload.personal;
  const evs = payload.events || [];
  const p1Age = 2026 - (parseInt(p.birthYear) || 0);

  // --- บันทึกลง Tab "REGISTRATIONS" ---
  let sheet1 = ss.getSheetByName(CONFIG.SHEET_NAMES.registrations);
  let e1Name = "", e1Partners = "";
  let e2Name = "", e2Partners = "";
  let teamName = "", teamMgr = "", teamPlayers = "";

  if (evs.length > 0) {
    e1Name = `${evs[0].category} - ${evs[0].name}`;
    e1Partners = formatPartners(evs[0]);
    if (evs[0].type === 'TEAM') {
      teamName = evs[0].teamName; teamMgr = evs[0].teamManagerEmail; teamPlayers = formatTeamPlayers(evs[0]);
    }
  }

  if (evs.length > 1) {
    e2Name = `${evs[1].category} - ${evs[1].name}`;
    e2Partners = formatPartners(evs[1]);
    if (evs[1].type === 'TEAM') {
      teamName = evs[1].teamName; teamMgr = evs[1].teamManagerEmail; teamPlayers = formatTeamPlayers(evs[1]);
    }
  }

  const row1 = [
    new Date(), tagId, "Pending", payload.totalFeeText,
    p.fullName, p.nationality, p.idNumber,
    p.email, p.phone, p.gender, p.birthYear, p.tshirt,
    e1Name, e1Partners, e2Name, e2Partners,
    teamName, teamMgr, teamPlayers, ""
  ];
  sheet1.appendRow(row1);
  

  // --- บันทึกลง Tab "ALL DATA" ---
  let sheet2 = ss.getSheetByName(CONFIG.SHEET_NAMES.allData);
  if (!sheet2) {
    setupSheetHeaders();
    sheet2 = ss.getSheetByName(CONFIG.SHEET_NAMES.allData);
  }

  if (evs.length > 0) {
    evs.forEach(ev => {
      let p2Age = ev.partnerBirthYear ? 2026 - parseInt(ev.partnerBirthYear) : "";
      let p3Age = ev.partner2BirthYear ? 2026 - parseInt(ev.partner2BirthYear) : "";

      let tName = ev.type === 'TEAM' ? ev.teamName : "";
      let tMgr = ev.type === 'TEAM' ? ev.teamManagerEmail : "";
      let tList = ev.type === 'TEAM' ? formatTeamPlayers(ev) : "";

      const row2 = [
        new Date(), tagId, "Pending", ev.category, ev.name, tName,
        p.fullName, p.nationality, p.idNumber, p.email, p.phone, p.gender, p.birthYear, p1Age, p.tshirt,
        ev.partnerName || "", ev.partnerNat || "", ev.partnerId || "", ev.partnerEmail || "", ev.partnerBirthYear || "", p2Age, ev.partnerTshirt || "",
        ev.partner2Name || "", ev.partner2Nat || "", ev.partner2Id || "", ev.partner2Email || "", ev.partner2BirthYear || "", p3Age, ev.partner2Tshirt || "",
        tMgr, tList
      ];
      sheet2.appendRow(row2);
    });
  }
  
  // สั่งส่งอีเมลหาผู้สมัคร
  sendConfirmationEmail(p, evs, tagId, payload.totalFeeText);
  
  return { success: true, tagID: tagId };
}

function formatPartners(ev) {
  let str = "";
  if (ev.partnerName) {
    str += `[P2] ${ev.partnerName} (${ev.partnerNat}) | ID: ${ev.partnerId} | Size: ${ev.partnerTshirt} | Year: ${ev.partnerBirthYear || '-'}\n`;
    if (ev.partnerEmail) str += `Email: ${ev.partnerEmail}\n`;
  }
  if (ev.partner2Name) {
    str += `[P3] ${ev.partner2Name} (${ev.partner2Nat}) | ID: ${ev.partner2Id} | Size: ${ev.partner2Tshirt} | Year: ${ev.partner2BirthYear || '-'}\n`;
    if (ev.partner2Email) str += `Email: ${ev.partner2Email}`;
  }
  return str.trim();
}

function formatTeamPlayers(ev) {
  let players = [];
  for(let i = 1; i <= 7; i++) {
    if (ev['player'+i]) players.push(`(${i}) ${ev['player'+i]}`);
  }
  return players.join(", ");
}

/**
 * ฟังก์ชันส่งอีเมลยืนยันการสมัคร
 * อัปเดตข้อมูลบัญชีเป็น Bannakan W.
 */
function sendConfirmationEmail(personal, events, tagId, totalFee) {
  const email = personal.email;
  const subject = `[${CONFIG.TOURNAMENT_NAME}] Registration Confirmation - Tag ID: ${tagId}`;
  
  let eventsListHtml = "";
  events.forEach(e => {
    eventsListHtml += `<li>${e.category} - ${e.name}</li>`;
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 20px; background-color: #1976D2; color: white; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0;">${CONFIG.TOURNAMENT_NAME}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Registration Successful</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Dear <strong>${personal.fullName}</strong>,</p>
        <p>We have successfully received your registration. Please review the details below and proceed with the payment to confirm your spot.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1976D2;">Registration Details</h3>
          <p><strong>TAG ID:</strong> <span style="font-family: monospace; font-size: 1.2em; font-weight: bold; color: #d32f2f;">${tagId}</span></p>
          <p><strong>Registered Events:</strong></p>
          <ul style="margin-top: 5px;">${eventsListHtml}</ul>
          <p style="margin-bottom: 0;"><strong>Total Amount Due:</strong> <span style="color: #4CAF50; font-size: 1.4em; font-weight: bold;">${totalFee}</span></p>
        </div>
        
        <h3 style="color: #ff9800; border-bottom: 1px solid #eee; padding-bottom: 5px;">Payment Details</h3>
        <div style="background: #fff8e1; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Bank:</strong> Bangkok Bank Public Company Limited (Si Phraya Branch)</p>
          <p style="margin: 5px 0;"><strong>Account Name:</strong> FYC CLUB</p>
          <p style="margin: 5px 0;"><strong>Account No.:</strong> 170-0-62367-9</p>
          <p style="margin: 5px 0;"><strong>SWIFT Code:</strong> BKKBTHBK</p>
          <p style="margin: 10px 0 0 0; color: #d32f2f; font-weight: bold; font-size: 0.9em;">
            IMPORTANT: Please include your TAG ID (${tagId}) in the transfer memo/note.
          </p>
          <p style="margin: 5px 0 0 0; color: #d32f2f; font-weight: bold; font-size: 0.9em;">
            * Thai participants must complete the payment before the announcement date. Registration fees are non-refundable in any case.
          </p>
        </div>
        
        <h3 style="color: #333; font-size: 1.1em;">Next Steps for Confirmation:</h3>
        <ol style="padding-left: 20px;">
          <li>Transfer the exact amount to the bank account provided above.</li>
          <li>Take a screenshot or photo of the successful payment receipt (transfer slip).</li>
          <li>Reply to this email or send the slip to <strong>fycsawasdeecup@gmail.com</strong>.</li>
          <li>Wait for the final confirmation email from our admin team.</li>
        </ol>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
          Best regards,<br>
          Sawasdee Cup 2026 Organizing Committee
        </p>
      </div>
    </div>
  `;

  try {
    GmailApp.sendEmail(email, subject, "Please open with an HTML-supported email client.", {
      htmlBody: htmlBody,
      name: "Sawasdee Cup 2026",
      replyTo: "fycsawasdeecup@gmail.com" 
    });
  } catch (err) {
    Logger.log("Email sending failed: " + err.message);
  }
}