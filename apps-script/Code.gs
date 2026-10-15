/**
 * Virtualizeer contact form → Google Sheet.
 *
 * Deploy: Extensions → Apps Script in your sheet, paste this file, then
 * Deploy → New deployment → Web app, Execute as: Me, Who has access: Anyone.
 * Paste the /exec URL into `formEndpoint` in src/content.js.
 *
 * The script owns only the columns listed in FIELDS. It creates their headers
 * on the first submission, finds them by name after that (so you can move
 * them), and never writes to any other column. Add your own columns
 * (Status, Notes, Follow up…) anywhere and edit them freely.
 */

const SHEET_NAME = 'Leads';

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

function doPost(e) {
  const data = readPayload_(e);

  // Hidden field real visitors never fill in; bots usually do.
  if (data.website) return json_({ ok: true });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getSheet_();
    const cols = ensureHeaders_(sheet);
    const row = nextRow_(sheet, cols.submitted_at);

    FIELDS.forEach(([key]) => {
      const value = key === 'submitted_at' ? new Date() : clean_(data[key]);
      sheet.getRange(row, cols[key]).setValue(value);
    });

    return json_({ ok: true, row });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'Virtualizeer form endpoint is running.' });
}

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
      const cell = sheet.getRange(1, nextFree);
      cell.setValue(label).setFontWeight('bold');
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
