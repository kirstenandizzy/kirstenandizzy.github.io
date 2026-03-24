/**
 * Google Apps Script — deploy this as a Web App to receive RSVP submissions.
 *
 * Setup steps:
 * 1. Create a new Google Sheet (this will store your responses)
 * 2. Go to Extensions → Apps Script
 * 3. Paste this entire script into the editor (replace any existing code)
 * 4. Click Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and add it to your .env file as:
 *    VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/YOUR_ID/exec
 * 6. The first row of your sheet will be auto-populated as headers
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var timestamp = new Date().toISOString();

  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    var headers = ['Timestamp'];
    for (var h = 1; h <= 20; h++) {
      headers.push('Guest ' + h);
      headers.push('RSVP ' + h);
    }
    headers.push('Dietary');
    headers.push('Message');
    sheet.appendRow(headers);
  }

  // One row per submission — all flat top-level keys
  var row = [timestamp];
  for (var i = 1; i <= 20; i++) {
    row.push(data['guest_' + i] || '');
    row.push(data['rsvp_' + i] || '');
  }
  row.push(data.dietary || '');
  row.push(data.message || '');

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
