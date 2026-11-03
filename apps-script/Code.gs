/**
 * Virtualizeer contact form → Google Sheet + emails from Zoho Mail.
 *
 * Every submission:
 *   1. is saved to the "Leads" tab (headers are created automatically),
 *   2. gets a designed confirmation email sent to the visitor,
 *   3. sends a designed notification to info@virtualizeer.com
 *      (partnership requests are marked as such).
 *
 * The script finds columns by their title on HEADER_ROW and writes only the
 * ones listed in its field lists, once per new row. Status starts as "New" and
 * is yours to change after that; Notes and any columns you add are never touched.
 *
 * Job applications from /careers go to the "Applicants" tab instead, the
 * HR team at HR_ADDRESS is emailed the applicant's details, and
 * their CVs are saved to a private Drive folder (run setupSheet() once).
 *
 * One-time Zoho setup: see setupZoho() at the bottom of this file.
 * After pasting a new version: Deploy → Manage deployments → Edit →
 * Version: New version → Deploy (the /exec URL stays the same).
 */

const SHEET_NAME = 'Leads';
// Rows 1-3 are the branded banner; column titles sit on row 4, data starts on 5.
const HEADER_ROW = 4;
const FROM_NAME = 'Virtualizeer';
const FROM_ADDRESS = 'info@virtualizeer.com'; // your Zoho mailbox
const NOTIFY_TO = 'info@virtualizeer.com';
const HR_ADDRESS = 'hr@virtualizeer.com'; // connected on its own login: see setupHrZoho()
const HR_PREFIX = 'HR_';
const SITE = 'https://www.virtualizeer.com';
const LOGO = SITE + '/brand/logo-h-white.png';
// Zoho data centre: 'com' (default), 'eu', 'in', 'com.au', 'jp', 'ca', 'sa'
const ZOHO_DC = 'com';

// [key sent by the website, header shown in the sheet]
const FIELDS = [
  ['submitted_at', 'Submitted at'],
  ['status', 'Status'],
  ['type', 'Type'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['company', 'Company'],
  ['size', 'Size'],
  ['services', 'Services'],
  ['message', 'Message'],
  ['page', 'Page'],
];

const APPLICATIONS_SHEET = 'Applicants';
const APPLICATION_FIELDS = [
  ['submitted_at', 'Submitted at'],
  ['status', 'Status'],
  ['role', 'Role'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['linkedin', 'LinkedIn'],
  ['cv', 'CV'],
  ['message', 'Why this role'],
  ['page', 'Page'],
];

// Keep in sync with CV_EXTENSIONS and CV_MAX_MB in src/pages/Careers.jsx
const CV_FOLDER_NAME = 'Virtualizeer job applications';
const CV_MAX_BYTES = 5 * 1024 * 1024;
const CV_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

const MAX_LENGTH = 5000;

/* ───────────────────────── Web app ───────────────────────── */

function doPost(e) {
  const data = readPayload_(e);

  // Hidden field real visitors never fill in; bots usually do.
  if (data.website) return json_({ ok: true });

  if (data.type === 'Application') return handleApplication_(data);

  const lead = {};
  FIELDS.forEach(([key]) => { lead[key] = key === 'submitted_at' ? new Date() : clean_(data[key]); });
  lead.status = 'New';
  if (!lead.type) lead.type = 'Quote';

  let row;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const cols = ensureHeaders_(sheet);
    row = nextRow_(sheet, cols.submitted_at);
    FIELDS.forEach(([key]) => sheet.getRange(row, cols[key]).setValue(lead[key]));
    SpreadsheetApp.flush();
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }

  // Emails go out after the row is safe, so a mail problem never loses a lead.
  const mail = { confirmation: false, notification: false };
  if (isEmail_(lead.email)) {
    try { sendMail_(lead.email, confirmationSubject_(lead), confirmationHtml_(lead)); mail.confirmation = true; }
    catch (err) { console.error('Confirmation email failed: ' + err); }
  }
  try { sendMail_(NOTIFY_TO, notificationSubject_(lead), notificationHtml_(lead, row)); mail.notification = true; }
  catch (err) { console.error('Notification email failed: ' + err); }

  return json_({ ok: true, row, mail });
}

function doGet() {
  return json_({ ok: true, message: 'Virtualizeer form endpoint is running.' });
}

/* ───────────────────────── Job applications ───────────────────────── */

function handleApplication_(data) {
  const app = {};
  APPLICATION_FIELDS.forEach(([key]) => { app[key] = key === 'submitted_at' ? new Date() : clean_(data[key]); });
  app.status = 'New';
  // The apostrophe keeps it as text, or the sheet would drop a leading 0.
  app.phone = "'" + app.phone.replace(/^'/, '');

  // A CV problem never loses the application: the row and emails still go out.
  let cvUrl = '';
  try {
    cvUrl = saveCv_(data, app);
    app.cv = `=HYPERLINK("${cvUrl}","Open CV")`;
  } catch (err) {
    console.error('CV upload failed: ' + err);
    app.cv = 'Upload failed: ' + err.message;
  }

  let row;
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_(APPLICATIONS_SHEET);
    const cols = ensureHeaders_(sheet, APPLICATION_FIELDS);
    row = nextRow_(sheet, cols.submitted_at);
    APPLICATION_FIELDS.forEach(([key]) => sheet.getRange(row, cols[key]).setValue(app[key]));
    SpreadsheetApp.flush();
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }

  const mail = { confirmation: false, notification: false };
  if (isEmail_(app.email)) {
    try { sendHrMail_(app.email, applicationConfirmationSubject_(app), applicationConfirmationHtml_(app)); mail.confirmation = true; }
    catch (err) { console.error('Confirmation email failed: ' + err); }
  }
  try { sendHrMail_(HR_ADDRESS, `New application: ${app.role} from ${app.name}`, applicationNotificationHtml_(app, cvUrl, row)); mail.notification = true; }
  catch (err) { console.error('Notification email failed: ' + err); }

  return json_({ ok: true, row, mail });
}

// Saves the file privately in Drive and returns its link.
function saveCv_(data, app) {
  const originalName = String(data.cv_name || '');
  const ext = originalName.split('.').pop().toLowerCase();
  if (!CV_TYPES[ext]) throw new Error('unsupported file type: ' + originalName);
  if (!data.cv_data) throw new Error('no file received');
  const bytes = Utilities.base64Decode(String(data.cv_data));
  if (bytes.length > CV_MAX_BYTES) throw new Error('file is larger than the limit');

  const applicant = app.name.replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 80) || 'Applicant';
  const stamp = Utilities.formatDate(app.submitted_at, 'Africa/Cairo', 'yyyy-MM-dd HHmm');
  const blob = Utilities.newBlob(bytes, CV_TYPES[ext], `${applicant} - ${stamp}.${ext}`);
  return cvFolder_().createFile(blob).getUrl();
}

function cvFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('CV_FOLDER_ID');
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder(CV_FOLDER_NAME);
  props.setProperty('CV_FOLDER_ID', folder.getId());
  return folder;
}

// Run once from the editor: it grants Drive access, creates the CV folder and
// embeds the logo in both tabs, so Sheets stops asking to allow external access.
function setupSheet() {
  console.log('CVs are saved to ' + cvFolder_().getUrl());
  const logo = SpreadsheetApp.newCellImage().setSourceUrl(LOGO).setAltTextTitle(FROM_NAME).build();
  [SHEET_NAME, APPLICATIONS_SHEET].forEach((name) => getSheet_(name).getRange('A1').setValue(logo));
  console.log('Logo added to ' + SHEET_NAME + ' and ' + APPLICATIONS_SHEET);
}

function applicationConfirmationSubject_(app) {
  return `Thanks for applying to Virtualizeer, ${firstName_(app)}!`;
}

function applicationConfirmationHtml_(app) {
  const p = 'margin:0 0 18px;font-size:16px;line-height:1.65;color:#4a5866;';
  const link = 'color:#1f5f99;font-weight:600;text-decoration:none;';
  const body = `
    <p style="margin:0 0 10px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#8c6230;font-weight:700;">Application received</p>
    <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;color:#0f2a40;font-weight:800;">A warm hello from Virtualizeer, ${esc_(firstName_(app))}!</h1>
    <p style="${p}">Thank you for applying for the <strong style="color:#0f2a40;">${esc_(app.role)}</strong>. At Virtualizeer, we help people step inside spaces before they arrive, through virtual tours, digital twins and websites, and every person who joins us helps shape what we build. We’re genuinely glad you want to be part of it.</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#4a5866;">Your application and CV have reached our Talent Acquisition team safely.</p>
    ${stepsHtml_('What happens next', [
      'Our Talent Acquisition team reviews your application and CV.',
      'If your profile matches the role, a member of our HR team will call or email you to arrange an interview.',
      'You meet the team, ask us anything and see how we work.',
    ])}
    <p style="margin:24px 0 18px;font-size:16px;line-height:1.65;color:#4a5866;">Our team reviews every application carefully, so it can take a little time. Thank you for your patience while we do.</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#4a5866;">In the meantime, take a look at the spaces we’ve brought online, and follow along on <a href="https://www.linkedin.com/company/virtualizeer" style="${link}">LinkedIn</a> and <a href="https://www.instagram.com/virtualizeer/" style="${link}">Instagram</a> to see what life at Virtualizeer looks like.</p>
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      ${buttonHtml_(SITE + '/projects', 'See our work', true)}
      <td style="width:10px;"></td>
      ${buttonHtml_(SITE + '/careers', 'View open roles', false)}
    </tr></table>
    <p style="margin:28px 0 0;font-size:15px;line-height:1.65;color:#4a5866;">Have a question, or something to add to your application? Just reply to this email and it will reach our HR team directly.</p>
    <p style="margin:24px 0 0;font-size:16px;line-height:1.6;color:#0f2a40;">Best of luck, and talk soon!<br><strong>The Virtualizeer Talent Acquisition Team</strong></p>`;
  return layoutHtml_('Thanks for applying to Virtualizeer', body, HR_ADDRESS);
}

function applicationNotificationHtml_(app, cvUrl, row) {
  const when = Utilities.formatDate(app.submitted_at, 'Africa/Cairo', 'EEE d MMM yyyy, HH:mm');
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const phone = esc_(app.phone);
  const linkedin = /^https?:\/\//i.test(app.linkedin)
    ? `<a href="${esc_(app.linkedin)}" style="color:#1f5f99;">${esc_(app.linkedin)}</a>`
    : esc_(app.linkedin);

  const rows = [
    ['Role', app.role],
    ['Email', `<a href="mailto:${esc_(app.email)}" style="color:#1f5f99;">${esc_(app.email)}</a>`, true],
    ['Phone', `<a href="tel:${esc_(app.phone.replace(/[^\p{Nd}+]/gu, ''))}" style="color:#1f5f99;">${phone}</a>`, true],
    ['LinkedIn', linkedin, true],
    ['Why this role', app.message],
    ['CV', cvUrl ? '' : app.cv],
    ['Received', when],
  ].filter(([, v]) => v);

  const body = `
    <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e6f4ec;color:#1c6b3f;font-size:12px;font-weight:700;letter-spacing:.04em;">JOB APPLICATION</span>
    <h1 style="margin:14px 0 6px;font-size:24px;line-height:1.25;color:#0f2a40;font-weight:800;">${esc_(app.name || 'New applicant')}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5866;">applied for the ${esc_(app.role)}.</p>
    ${tableHtml_(rows)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr>
      ${cvUrl ? buttonHtml_(cvUrl, 'Open CV', true) : ''}
      <td style="width:10px;"></td>
      ${buttonHtml_(sheetUrl, `Open in sheet (row ${row})`, false)}
    </tr></table>`;
  return layoutHtml_('New job application', body, HR_ADDRESS);
}

/* ───────────────────────── Sheet ───────────────────────── */

function readPayload_(e) {
  if (!e) return {};
  const body = e.postData && e.postData.contents;
  if (body && e.postData.type === 'application/json') {
    try { return JSON.parse(body); } catch (_) { /* fall through to form fields */ }
  }
  return e.parameter || {};
}

function getSheet_(name = SHEET_NAME) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

// Returns { key: columnNumber }. Adds only the headers that are missing.
function ensureHeaders_(sheet, fields = FIELDS) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(HEADER_ROW, 1, 1, lastCol).getValues()[0]
    .map((h) => String(h).trim().toLowerCase());
  const sheetIsNew = headers.every((h) => h === '');

  const cols = {};
  let nextFree = sheetIsNew ? 1 : lastCol + 1;
  fields.forEach(([key, label]) => {
    const found = headers.indexOf(label.toLowerCase());
    if (found !== -1) {
      cols[key] = found + 1;
    } else {
      sheet.getRange(HEADER_ROW, nextFree).setValue(label).setFontWeight('bold');
      cols[key] = nextFree;
      nextFree += 1;
    }
  });

  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(HEADER_ROW);
  return cols;
}

// The row after the last filled "Submitted at" cell, so text you type in
// your own columns further down never pushes new leads out of place.
function nextRow_(sheet, timestampCol) {
  const maxRows = sheet.getMaxRows();
  const values = sheet.getRange(1, timestampCol, maxRows, 1).getValues();
  let last = HEADER_ROW;
  for (let i = values.length - 1; i >= HEADER_ROW; i--) {
    if (values[i][0] !== '' && values[i][0] !== null) { last = i + 1; break; }
  }
  const row = last + 1;
  if (row > maxRows) sheet.insertRowsAfter(maxRows, 50);
  return row;
}

// Plain text only: stops a submission from becoming a formula in the sheet.
function clean_(value) {
  if (value === undefined || value === null) return '';
  let s = Array.isArray(value) ? value.join(', ') : String(value);
  s = s.trim().slice(0, MAX_LENGTH);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ───────────────────────── Sending ───────────────────────── */

// Sends through the Zoho Mail API once setupZoho() has run; until then it
// falls back to the Google account that owns this script.
function sendMail_(to, subject, html, from = FROM_ADDRESS) {
  const props = PropertiesService.getScriptProperties();
  // HR has its own Zoho login once setupHrZoho() has run.
  const prefix = from === HR_ADDRESS && props.getProperty(HR_PREFIX + 'ZOHO_ACCOUNT_ID') ? HR_PREFIX : '';
  const accountId = props.getProperty(prefix + 'ZOHO_ACCOUNT_ID');
  if (!accountId) {
    MailApp.sendEmail({ to, subject, htmlBody: html, name: FROM_NAME, replyTo: from });
    return;
  }
  const res = UrlFetchApp.fetch(`https://mail.zoho.${ZOHO_DC}/api/accounts/${accountId}/messages`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Zoho-oauthtoken ' + zohoToken_(prefix) },
    payload: JSON.stringify({
      fromAddress: from,
      toAddress: to,
      subject,
      content: html,
      mailFormat: 'html',
      askReceipt: 'no',
    }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() >= 300) throw new Error('Zoho ' + res.getResponseCode() + ': ' + res.getContentText());
}

// Careers emails go from HR. If Zoho refuses that address, the main mailbox
// sends instead, so an applicant never misses their confirmation.
function sendHrMail_(to, subject, html) {
  try {
    sendMail_(to, subject, html, HR_ADDRESS);
  } catch (err) {
    console.error('Sending from ' + HR_ADDRESS + ' failed, using ' + FROM_ADDRESS + ': ' + err);
    sendMail_(to, subject, html);
  }
}

// Run after setupHrZoho(): it fails loudly if HR can't send yet.
function testHrEmail() {
  sendMail_(NOTIFY_TO, 'Careers emails can send from ' + HR_ADDRESS, applicationConfirmationHtml_({ name: 'Test Person', role: 'Sales Internship' }), HR_ADDRESS);
  console.log('Test email sent from ' + HR_ADDRESS + ' to ' + NOTIFY_TO);
}

// Access tokens last an hour; cache one for 50 minutes.
function zohoToken_(prefix = '') {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(prefix + 'zoho_token');
  if (cached) return cached;
  const props = PropertiesService.getScriptProperties();
  const res = UrlFetchApp.fetch(`https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`, {
    method: 'post',
    payload: {
      refresh_token: props.getProperty(prefix + 'ZOHO_REFRESH_TOKEN'),
      client_id: props.getProperty(prefix + 'ZOHO_CLIENT_ID'),
      client_secret: props.getProperty(prefix + 'ZOHO_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    },
    muteHttpExceptions: true,
  });
  const body = JSON.parse(res.getContentText());
  if (!body.access_token) throw new Error('Zoho token refresh failed: ' + res.getContentText());
  cache.put(prefix + 'zoho_token', body.access_token, 3000);
  return body.access_token;
}

/* ───────────────────────── Email content ───────────────────────── */

function isPartner_(lead) { return /partner/i.test(lead.type); }
function firstName_(lead) { return (lead.name || '').split(/\s+/)[0] || 'there'; }
function isEmail_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ''); }

function esc_(v) {
  return String(v == null ? '' : v).replace(/^'/, '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function confirmationSubject_(lead) {
  return isPartner_(lead) ? 'Thanks for reaching out to partner with Virtualizeer' : 'We received your message';
}

function notificationSubject_(lead) {
  const who = lead.company ? `${lead.name} (${lead.company})` : lead.name;
  return isPartner_(lead) ? `New partnership request from ${who}` : `New quote request from ${who}`;
}

function confirmationHtml_(lead) {
  const partner = isPartner_(lead);
  const intro = partner
    ? 'Thanks for your interest in partnering with Virtualizeer. We’ve received your message and our team will get back to you within one business day to talk about how we can work together.'
    : 'Thanks for getting in touch. We’ve received your message and will reply within one business day with next steps and a quote.';
  const steps = partner
    ? ['We review your message.', 'We set up a short intro call.', 'We agree how we work together.']
    : ['We read your message and reply by email.', 'A short call to understand your space.', 'You get a clear quote and timeline.'];

  const summary = [
    ['Services', lead.services],
    ['Company', lead.company],
    ['Size', lead.size],
    ['Message', lead.message],
  ].filter(([, v]) => v);

  const body = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#0f2a40;font-weight:800;">Thanks, ${esc_(firstName_(lead))}!</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a5866;">${intro}</p>
    ${stepsHtml_(partner ? 'What happens next' : 'What happens next', steps)}
    ${summary.length ? `
      <p style="margin:28px 0 10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7785;font-weight:700;">Your message</p>
      ${tableHtml_(summary)}` : ''}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr>
      ${buttonHtml_(SITE + '/projects', 'See our work', true)}
      <td style="width:10px;"></td>
      ${buttonHtml_(SITE + '/virtual-tours', 'Explore virtual tours', false)}
    </tr></table>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#6b7785;">Need to add something? Just reply to this email.</p>`;

  return layoutHtml_(partner ? 'Partnership request received' : 'Message received', body);
}

function notificationHtml_(lead, row) {
  const partner = isPartner_(lead);
  const badge = partner
    ? '<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#fdf1d8;color:#8a5a00;font-size:12px;font-weight:700;letter-spacing:.04em;">PARTNERSHIP</span>'
    : '<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e6f0fa;color:#1f5f99;font-size:12px;font-weight:700;letter-spacing:.04em;">QUOTE REQUEST</span>';
  const when = Utilities.formatDate(lead.submitted_at, 'Africa/Cairo', 'EEE d MMM yyyy, HH:mm');
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const replySubject = encodeURIComponent('Re: your message to Virtualizeer');

  const rows = [
    ['Name', lead.name],
    ['Email', `<a href="mailto:${esc_(lead.email)}" style="color:#1f5f99;">${esc_(lead.email)}</a>`, true],
    ['Company', lead.company],
    ['Services', lead.services],
    ['Size', lead.size],
    ['Message', lead.message],
    ['Sent from', lead.page],
    ['Received', when],
  ].filter(([, v]) => v);

  const body = `
    ${badge}
    <h1 style="margin:14px 0 6px;font-size:24px;line-height:1.25;color:#0f2a40;font-weight:800;">${esc_(lead.name || 'New lead')}${lead.company ? ` <span style="color:#6b7785;font-weight:600;">· ${esc_(lead.company)}</span>` : ''}</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5866;">${partner ? 'wants to partner with Virtualizeer.' : 'is asking for a quote.'}</p>
    ${tableHtml_(rows)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr>
      ${isEmail_(lead.email) ? buttonHtml_(`mailto:${esc_(lead.email)}?subject=${replySubject}`, `Reply to ${esc_(firstName_(lead))}`, true) : ''}
      <td style="width:10px;"></td>
      ${buttonHtml_(sheetUrl, `Open in sheet (row ${row})`, false)}
    </tr></table>`;

  return layoutHtml_(partner ? 'New partnership request' : 'New quote request', body);
}

/* ───────────────────────── Email building blocks ───────────────────────── */

function layoutHtml_(preheader, inner, contact = FROM_ADDRESS) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc_(preheader)}</title></head>
<body style="margin:0;padding:0;background:#eef1f5;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc_(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5;padding:32px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
    <tr><td style="background:#0f2a40;border-radius:20px 20px 0 0;padding:28px 36px;">
      <img src="${LOGO}" alt="Virtualizeer" width="150" style="display:block;width:150px;height:auto;border:0;">
    </td></tr>
    <tr><td style="background:#0f2a40;padding:0 36px;"><div style="height:4px;width:64px;background:#3b82c4;border-radius:4px;"></div></td></tr>
    <tr><td style="background:#0f2a40;height:20px;"></td></tr>
    <tr><td style="background:#ffffff;border-radius:0 0 20px 20px;padding:36px;">${inner}</td></tr>
    <tr><td style="padding:24px 12px;text-align:center;font-size:12px;line-height:1.7;color:#6b7785;">
      Virtualizeer · Virtual tours, digital twins and websites · Cairo, Egypt<br>
      <a href="${SITE}" style="color:#1f5f99;text-decoration:none;">virtualizeer.com</a> ·
      <a href="mailto:${contact}" style="color:#1f5f99;text-decoration:none;">${contact}</a>
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

function stepsHtml_(title, steps) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;border-radius:14px;">
    <tr><td style="padding:20px 22px 6px;font-size:15px;font-weight:700;color:#0f2a40;">${esc_(title)}</td></tr>
    ${steps.map((s, i) => `<tr><td style="padding:8px 22px ${i === steps.length - 1 ? '20px' : '8px'};">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="width:26px;height:26px;border-radius:50%;background:#0f2a40;color:#ffffff;font-size:12px;font-weight:700;text-align:center;vertical-align:middle;">${i + 1}</td>
        <td style="padding-left:12px;font-size:15px;color:#4a5866;">${esc_(s)}</td>
      </tr></table></td></tr>`).join('')}
  </table>`;
}

// rows: [label, value, valueIsHtml]
function tableHtml_(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e5ea;border-radius:14px;border-collapse:separate;">
    ${rows.map(([k, v, raw], i) => `<tr>
      <td style="padding:12px 16px;width:110px;vertical-align:top;font-size:13px;color:#6b7785;${i ? 'border-top:1px solid #e2e5ea;' : ''}">${esc_(k)}</td>
      <td style="padding:12px 16px;font-size:15px;line-height:1.55;color:#0f2a40;white-space:pre-wrap;${i ? 'border-top:1px solid #e2e5ea;' : ''}">${raw ? v : esc_(v)}</td>
    </tr>`).join('')}
  </table>`;
}

function buttonHtml_(href, label, primary) {
  const style = primary
    ? 'background:#0f2a40;color:#ffffff;border:1px solid #0f2a40;'
    : 'background:#ffffff;color:#0f2a40;border:1px solid #c9d2dc;';
  return `<td style="border-radius:999px;${style}"><a href="${href}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;${style}">${label}</a></td>`;
}

/* ───────────────────────── One-time Zoho setup ───────────────────────── */

/**
 * 1. Go to https://api-console.zoho.com → Add Client → Self Client → Create.
 * 2. Copy the Client ID and Client Secret.
 * 3. In the Self Client, open "Generate Code", scope:
 *      ZohoMail.messages.CREATE,ZohoMail.accounts.READ
 *    time 10 minutes, any description → Create, then copy the code.
 * 4. Here in Apps Script: Project Settings (gear) → Script Properties → add
 *      ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_GRANT_CODE
 * 5. Select setupZoho in the toolbar and click Run (within 10 minutes of step 3).
 *    It saves a permanent refresh token and your account ID, then sends a
 *    test email to info@virtualizeer.com. Check the Execution log.
 */
function setupZoho() {
  connectZoho_('', FROM_ADDRESS);
}

/**
 * Connects hr@ on its own login, the same way, with two differences:
 *   - do steps 1 to 3 while logged in to Zoho as hr@virtualizeer.com,
 *   - name the Script Properties HR_ZOHO_CLIENT_ID, HR_ZOHO_CLIENT_SECRET
 *     and HR_ZOHO_GRANT_CODE, then run setupHrZoho.
 */
function setupHrZoho() {
  connectZoho_(HR_PREFIX, HR_ADDRESS);
}

function connectZoho_(prefix, address) {
  const props = PropertiesService.getScriptProperties();
  const code = props.getProperty(prefix + 'ZOHO_GRANT_CODE');
  if (code) {
    const res = UrlFetchApp.fetch(`https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`, {
      method: 'post',
      payload: {
        code,
        client_id: props.getProperty(prefix + 'ZOHO_CLIENT_ID'),
        client_secret: props.getProperty(prefix + 'ZOHO_CLIENT_SECRET'),
        grant_type: 'authorization_code',
      },
      muteHttpExceptions: true,
    });
    const body = JSON.parse(res.getContentText());
    if (!body.refresh_token) throw new Error('Could not get a refresh token (the code may have expired): ' + res.getContentText());
    props.setProperty(prefix + 'ZOHO_REFRESH_TOKEN', body.refresh_token);
    props.deleteProperty(prefix + 'ZOHO_GRANT_CODE');
    CacheService.getScriptCache().put(prefix + 'zoho_token', body.access_token, 3000);
    console.log('Saved refresh token.');
  }

  const res = UrlFetchApp.fetch(`https://mail.zoho.${ZOHO_DC}/api/accounts`, {
    headers: { Authorization: 'Zoho-oauthtoken ' + zohoToken_(prefix) },
    muteHttpExceptions: true,
  });
  const accounts = (JSON.parse(res.getContentText()).data || []);
  const owns = (a) => (a.emailAddress || []).some((e) => e.mailId === address) || a.primaryEmailAddress === address;
  // HR must match exactly, so a code made while logged in as info@ can't pass as hr@.
  const match = accounts.find(owns) || (prefix ? null : accounts[0]);
  if (!match) throw new Error('No Zoho Mail account for ' + address + ' on this login: ' + res.getContentText());
  props.setProperty(prefix + 'ZOHO_ACCOUNT_ID', String(match.accountId));
  console.log('Saved Zoho account ' + match.accountId + ' (' + (match.primaryEmailAddress || '') + ')');

  sendMail_(NOTIFY_TO, 'Virtualizeer form emails are connected', layoutHtml_('Test email',
    '<h1 style="margin:0 0 12px;font-size:24px;color:#0f2a40;">It works.</h1><p style="margin:0;font-size:16px;color:#4a5866;">Form emails will now be sent from ' + address + ' through Zoho Mail.</p>', address), address);
  console.log('Test email sent to ' + NOTIFY_TO);
}

// Run this to preview both emails in your inbox without submitting the form.
function sendTestEmails() {
  const lead = {
    submitted_at: new Date(), type: 'Partnership', name: 'Test Person', email: NOTIFY_TO,
    company: 'Test Company', size: '', services: 'Virtual Tours', message: 'We’d like to partner with Virtualizeer.', page: SITE + '/contact',
  };
  sendMail_(NOTIFY_TO, confirmationSubject_(lead), confirmationHtml_(lead));
  sendMail_(NOTIFY_TO, notificationSubject_(lead), notificationHtml_(lead, 2));
}
