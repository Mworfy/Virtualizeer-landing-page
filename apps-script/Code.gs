/**
 * Virtualizeer contact form → Google Sheet + emails from Zoho Mail.
 *
 * Every submission:
 *   1. is saved to the "Leads" tab (headers are created automatically),
 *   2. gets a designed confirmation email sent to the visitor,
 *   3. sends a designed notification to info@virtualizeer.com
 *      (partnership requests are marked as such).
 *
 * The script owns only the columns listed in FIELDS. It never writes to any
 * other column, so add your own (Status, Notes…) and edit them freely.
 *
 * One-time Zoho setup: see setupZoho() at the bottom of this file.
 * After pasting a new version: Deploy → Manage deployments → Edit →
 * Version: New version → Deploy (the /exec URL stays the same).
 */

const SHEET_NAME = 'Leads';
const FROM_NAME = 'Virtualizeer';
const FROM_ADDRESS = 'info@virtualizeer.com'; // your Zoho mailbox
const NOTIFY_TO = 'info@virtualizeer.com';
const SITE = 'https://www.virtualizeer.com';
const LOGO = SITE + '/brand/logo-h-white.png';
// Zoho data centre: 'com' (default), 'eu', 'in', 'com.au', 'jp', 'ca', 'sa'
const ZOHO_DC = 'com';

// [key sent by the website, header shown in the sheet]
const FIELDS = [
  ['submitted_at', 'Submitted at'],
  ['type', 'Type'],
  ['name', 'Name'],
  ['email', 'Email'],
  ['company', 'Company'],
  ['size', 'Size'],
  ['services', 'Services'],
  ['message', 'Message'],
  ['page', 'Page'],
];

const MAX_LENGTH = 5000;

/* ───────────────────────── Web app ───────────────────────── */

function doPost(e) {
  const data = readPayload_(e);

  // Hidden field real visitors never fill in; bots usually do.
  if (data.website) return json_({ ok: true });

  const lead = {};
  FIELDS.forEach(([key]) => { lead[key] = key === 'submitted_at' ? new Date() : clean_(data[key]); });
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

/* ───────────────────────── Sheet ───────────────────────── */

function readPayload_(e) {
  if (!e) return {};
  const body = e.postData && e.postData.contents;
  if (body && e.postData.type === 'application/json') {
    try { return JSON.parse(body); } catch (_) { /* fall through to form fields */ }
  }
  return e.parameter || {};
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

// Returns { key: columnNumber }. Adds only the headers that are missing.
function ensureHeaders_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
    .map((h) => String(h).trim().toLowerCase());
  const sheetIsNew = headers.every((h) => h === '');

  const cols = {};
  let nextFree = sheetIsNew ? 1 : lastCol + 1;
  FIELDS.forEach(([key, label]) => {
    const found = headers.indexOf(label.toLowerCase());
    if (found !== -1) {
      cols[key] = found + 1;
    } else {
      sheet.getRange(1, nextFree).setValue(label).setFontWeight('bold');
      cols[key] = nextFree;
      nextFree += 1;
    }
  });

  if (sheet.getFrozenRows() === 0) sheet.setFrozenRows(1);
  return cols;
}

// The row after the last filled "Submitted at" cell, so text you type in
// your own columns further down never pushes new leads out of place.
function nextRow_(sheet, timestampCol) {
  const maxRows = sheet.getMaxRows();
  const values = sheet.getRange(1, timestampCol, maxRows, 1).getValues();
  let last = 1;
  for (let i = values.length - 1; i >= 1; i--) {
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
function sendMail_(to, subject, html) {
  const props = PropertiesService.getScriptProperties();
  const accountId = props.getProperty('ZOHO_ACCOUNT_ID');
  if (!accountId) {
    MailApp.sendEmail({ to, subject, htmlBody: html, name: FROM_NAME, replyTo: FROM_ADDRESS });
    return;
  }
  const res = UrlFetchApp.fetch(`https://mail.zoho.${ZOHO_DC}/api/accounts/${accountId}/messages`, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Zoho-oauthtoken ' + zohoToken_() },
    payload: JSON.stringify({
      fromAddress: FROM_ADDRESS,
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

// Access tokens last an hour; cache one for 50 minutes.
function zohoToken_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('zoho_token');
  if (cached) return cached;
  const props = PropertiesService.getScriptProperties();
  const res = UrlFetchApp.fetch(`https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`, {
    method: 'post',
    payload: {
      refresh_token: props.getProperty('ZOHO_REFRESH_TOKEN'),
      client_id: props.getProperty('ZOHO_CLIENT_ID'),
      client_secret: props.getProperty('ZOHO_CLIENT_SECRET'),
      grant_type: 'refresh_token',
    },
    muteHttpExceptions: true,
  });
  const body = JSON.parse(res.getContentText());
  if (!body.access_token) throw new Error('Zoho token refresh failed: ' + res.getContentText());
  cache.put('zoho_token', body.access_token, 3000);
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

function layoutHtml_(preheader, inner) {
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
      <a href="mailto:${FROM_ADDRESS}" style="color:#1f5f99;text-decoration:none;">${FROM_ADDRESS}</a>
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
  const props = PropertiesService.getScriptProperties();
  const code = props.getProperty('ZOHO_GRANT_CODE');
  if (code) {
    const res = UrlFetchApp.fetch(`https://accounts.zoho.${ZOHO_DC}/oauth/v2/token`, {
      method: 'post',
      payload: {
        code,
        client_id: props.getProperty('ZOHO_CLIENT_ID'),
        client_secret: props.getProperty('ZOHO_CLIENT_SECRET'),
        grant_type: 'authorization_code',
      },
      muteHttpExceptions: true,
    });
    const body = JSON.parse(res.getContentText());
    if (!body.refresh_token) throw new Error('Could not get a refresh token (the code may have expired): ' + res.getContentText());
    props.setProperty('ZOHO_REFRESH_TOKEN', body.refresh_token);
    props.deleteProperty('ZOHO_GRANT_CODE');
    CacheService.getScriptCache().put('zoho_token', body.access_token, 3000);
    console.log('Saved refresh token.');
  }

  const res = UrlFetchApp.fetch(`https://mail.zoho.${ZOHO_DC}/api/accounts`, {
    headers: { Authorization: 'Zoho-oauthtoken ' + zohoToken_() },
    muteHttpExceptions: true,
  });
  const accounts = (JSON.parse(res.getContentText()).data || []);
  const match = accounts.find((a) => (a.emailAddress || []).some((e) => e.mailId === FROM_ADDRESS) || a.primaryEmailAddress === FROM_ADDRESS) || accounts[0];
  if (!match) throw new Error('No Zoho Mail account found: ' + res.getContentText());
  props.setProperty('ZOHO_ACCOUNT_ID', String(match.accountId));
  console.log('Saved Zoho account ' + match.accountId + ' (' + (match.primaryEmailAddress || '') + ')');

  sendMail_(NOTIFY_TO, 'Virtualizeer form emails are connected', layoutHtml_('Test email',
    '<h1 style="margin:0 0 12px;font-size:24px;color:#0f2a40;">It works.</h1><p style="margin:0;font-size:16px;color:#4a5866;">Form confirmations and notifications will now be sent from ' + FROM_ADDRESS + ' through Zoho Mail.</p>'));
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
