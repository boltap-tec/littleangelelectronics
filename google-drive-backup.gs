/*  ============================================================================
    LITTLE ANGEL ELECTRONICS — DAILY GOOGLE-DRIVE EXCEL BACKUP
    ----------------------------------------------------------------------------
    Runs entirely on Google's servers (NOT in the shop app). Every day it:
      1. Reads your whole database from Supabase (the single JSON row the app syncs)
      2. Builds a real Excel workbook (.xlsx) with a sheet per module
         + a RAW_JSON sheet that can restore the app EXACTLY
      3. Saves it into a Google Drive folder, with the date in the filename
      4. Keeps the last N days and deletes older ones (optional)
      5. (optional) emails you the file

    ONE-TIME SETUP  (takes ~3 minutes)
    ----------------------------------------------------------------------------
    1. Go to  https://script.google.com  →  New project.
    2. Delete the sample code, paste this whole file, click 💾 Save.
    3. In the CONFIG block below, set BACKUP_FOLDER_NAME (and EMAIL_TO if you
       want a copy mailed). The Supabase values are already filled in for you.
    4. Run the function  runBackupNow  once (top toolbar → select runBackupNow →
       Run). Google will ask you to authorise access to Drive/Gmail — approve it.
       Check your Drive: a folder with today's .xlsx should appear.
    5. Run the function  installDailyTrigger  once. That schedules it to run
       automatically every day (around the hour you set in CONFIG). Done.

    To STOP the daily backup later: run  removeDailyTrigger.
    ============================================================================ */

/* ----------------------------- CONFIG -------------------------------------- */
var CONFIG = {
  SUPABASE_URL : 'https://qnbhzeciebrpuuvzoljc.supabase.co',
  SUPABASE_KEY : 'sb_publishable_atQ3d2SUrIgvyaP2DhqhAg_oM8ciR4U', // anon/publishable key
  TABLE        : 'app_state',
  ROW_ID       : 'main',

  // Save into THIS existing Drive folder (from your shared link). Leave BACKUP_FOLDER_ID
  // set to use it; if you ever blank it out, the script falls back to BACKUP_FOLDER_NAME.
  BACKUP_FOLDER_ID   : '1GBVEZlwkrCQXC3cbgWRovZK2rP-ZB6W4',
  BACKUP_FOLDER_NAME : 'Little Angel Electronics Backups', // used only if BACKUP_FOLDER_ID is blank
  FILENAME_PREFIX    : 'LAE_backup_',                      // file becomes LAE_backup_2026-09-29.xlsx
  KEEP_DAYS          : 60,     // delete backups older than this many days (0 = keep everything)
  RUN_AT_HOUR        : 1,      // 24h clock, backup runs sometime in this hour (1 = ~1 AM)

  EMAIL_TO           : ''      // e.g. 'arulece05@gmail.com' to also receive the file; '' = don't email
};

/* ============================ ENTRY POINTS ================================= */

/** Run this once manually to test, and it's also what the daily trigger calls. */
function runBackupNow() {
  var db = fetchDatabase_();
  var file = buildAndSaveWorkbook_(db);
  pruneOldBackups_();
  if (CONFIG.EMAIL_TO) {
    MailApp.sendEmail({
      to: CONFIG.EMAIL_TO,
      subject: 'Little Angel Electronics — backup ' + today_(),
      body: 'Attached is today\'s automatic backup (also saved in your Google Drive folder "' +
            CONFIG.BACKUP_FOLDER_NAME + '").',
      attachments: [file.getAs('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')]
    });
  }
  Logger.log('Backup complete: ' + file.getName() + '  (' + file.getUrl() + ')');
  return file.getUrl();
}

/** Run this once to schedule the daily automatic backup. */
function installDailyTrigger() {
  removeDailyTrigger();
  ScriptApp.newTrigger('runBackupNow')
    .timeBased().everyDays(1).atHour(CONFIG.RUN_AT_HOUR).create();
  Logger.log('Daily backup scheduled for ~' + CONFIG.RUN_AT_HOUR + ':00 every day.');
}

/** Run this to stop the daily automatic backup. */
function removeDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'runBackupNow') ScriptApp.deleteTrigger(t);
  });
}

/* ============================ CORE LOGIC ================================== */

/** Pull the whole database (the app_state.data JSON) from Supabase. */
function fetchDatabase_() {
  var url = CONFIG.SUPABASE_URL + '/rest/v1/' + CONFIG.TABLE +
            '?id=eq.' + encodeURIComponent(CONFIG.ROW_ID) + '&select=data,updated_at';
  var res = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      apikey: CONFIG.SUPABASE_KEY,
      Authorization: 'Bearer ' + CONFIG.SUPABASE_KEY,
      Accept: 'application/json'
    }
  });
  if (res.getResponseCode() !== 200) {
    throw new Error('Supabase read failed (' + res.getResponseCode() + '): ' + res.getContentText());
  }
  var rows = JSON.parse(res.getContentText());
  if (!rows || !rows.length || !rows[0].data) {
    throw new Error('No data found in ' + CONFIG.TABLE + ' row "' + CONFIG.ROW_ID + '".');
  }
  return rows[0].data; // the full DB object
}

/** Build a temp Google Sheet, fill every tab, export it as .xlsx into Drive, trash the temp. */
function buildAndSaveWorkbook_(db) {
  var ss = SpreadsheetApp.create('LAE_backup_tmp_' + Date.now());
  try {
    var prodName = buildProductLookup_(db.products);

    // --- Summary ---
    var summary = [
      ['Little Angel Electronics — Backup'],
      ['Generated', new Date()],
      [''],
      ['Table', 'Records'],
      ['Products',      count_(db.products)],
      ['Purchases',     count_(db.purchases)],
      ['Online Orders', count_(db.online)],
      ['Sales',         count_(db.sales)],
      ['Credit Cards',  count_(db.cards)],
      ['Gift Cards',    count_(db.giftcards)],
      ['Card Lenders',  count_(db.lenders)],
      ['Cash Entries',  count_(db.cash)],
      ['Activity Log',  count_(db.activity)],
      ['Users',         count_(db.users)]
    ];
    writeSheet_(ss, 'Summary', summary);

    // --- Sales ---
    var salesRows = [['Invoice','Date','Customer','Phone','Items','Subtotal','Discount','VAT %','VAT','Total','Paid','Balance','Method','Status']];
    (db.sales || []).slice().sort(byDateDesc_('date')).forEach(function (s) {
      var total = num_(s.total), paid = num_(s.paid);
      salesRows.push([ s.invoiceNo, s.date, s.customer || 'Walk-in', s.custPhone || '',
        itemNames_(s.items, prodName), num_(s.subtotal), num_(s.discount), num_(s.vatPercent),
        num_(s.vat), total, paid, round2_(total - paid), up_(s.payment), payStatus_(total, paid) ]);
    });
    writeSheet_(ss, 'Sales', salesRows);

    // --- Purchases ---
    var purRows = [['Ref','Date','Supplier','Products','Qty','Items Total','Discount','Net Total','Paid','Balance','Method','Status','From Online']];
    (db.purchases || []).slice().sort(byDateDesc_('date')).forEach(function (p) {
      var gross = itemsGross_(p.items), disc = Math.min(gross, num_(p.discount)), net = Math.max(0, gross - disc), paid = num_(p.paid);
      purRows.push([ p.ref, p.date, p.supplier || '', itemNames_(p.items, prodName), itemsQty_(p.items),
        round2_(gross), round2_(disc), round2_(net), paid, round2_(net - paid),
        up_(p.payment || 'cash'), payStatus_(net, paid), p.onlineRef || '' ]);
    });
    writeSheet_(ss, 'Purchases', purRows);

    // --- Online Orders ---
    var onlRows = [['Ref','Ordered','Expected','Delivered','Platform','Seller','Tracking','Products','Qty','Est. Total','Paid','Method','Status','Stocked As']];
    (db.online || []).slice().sort(byDateDesc_('orderDate')).forEach(function (o) {
      var gross = itemsGross_(o.items), disc = Math.min(gross, num_(o.discount)), net = Math.max(0, gross - disc);
      var linked = (db.purchases || []).filter(function (p) { return p.id === o.purchaseId; })[0];
      onlRows.push([ o.ref, o.orderDate, o.expectedDate || '', o.deliveredDate || '', o.platform || '', o.supplier || '',
        o.tracking || '', itemNames_(o.items, prodName), itemsQty_(o.items), round2_(net),
        num_(o.payAmt), up_(o.payMethod || ''), up_(o.status), linked ? linked.ref : '' ]);
    });
    writeSheet_(ss, 'Online Orders', onlRows);

    // --- Card Lenders (summary + full ledger) ---
    var lenderSign = { opening: 1, swipe: 1, advance: 1, repay: -1, adjust: 1 };
    var lenderSum = [['Lender','Phone','Cards','Outstanding','Commission Earned','Notes']];
    var ledger = [['Lender','Date','Type','Card','Swiped','Comm %','Commission','Note','Owed +','Paid -','Running Balance']];
    (db.lenders || []).forEach(function (l) {
      var bal = 0, comm = 0;
      var txns = (l.txns || []).slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : ((a.date || '') > (b.date || '') ? 1 : 0); });
      var cardLabels = (l.cards || []).map(function (c) { return c.label + ' (' + num_(c.commission) + '%)'; }).join(', ');
      txns.forEach(function (t) {
        var delta = (lenderSign[t.type] == null ? 1 : lenderSign[t.type]) * num_(t.amount);
        bal += delta;
        var c = t.type === 'swipe' ? round2_(num_(t.gross) - num_(t.amount)) : 0;
        comm += c;
        ledger.push([ l.name, t.date, up_(t.type), t.cardLabel || '',
          t.type === 'swipe' ? num_(t.gross) : '', t.type === 'swipe' ? num_(t.commission) : '',
          c || '', t.note || '' + (t.method ? ' (' + t.method + ')' : ''),
          delta > 0 ? round2_(delta) : '', delta < 0 ? round2_(-delta) : '', round2_(bal) ]);
      });
      lenderSum.push([ l.name, l.phone || '', cardLabels, round2_(bal), round2_(comm), l.notes || '' ]);
    });
    writeSheet_(ss, 'Card Lenders', lenderSum);
    writeSheet_(ss, 'Lender Ledger', ledger);

    // --- Inventory (simple weighted-average snapshot) ---
    var invRows = [['Product','Category','In Stock','Unit','Purchased','Sold','Avg Cost','Stock Value']];
    (db.products || []).slice().sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); }).forEach(function (pr) {
      var bought = 0, cost = 0, sold = 0;
      (db.purchases || []).forEach(function (p) { (p.items || []).forEach(function (it) {
        if (it.productId === pr.id) { bought += num_(it.qty); cost += num_(it.qty) * num_(it.rate); } }); });
      (db.online || []).forEach(function (o) { if (o.status === 'delivered') (o.items || []).forEach(function (it) {
        if (it.productId === pr.id) { bought += num_(it.qty); cost += num_(it.qty) * num_(it.rate); } }); });
      (db.sales || []).forEach(function (s) { (s.items || []).forEach(function (it) {
        if (it.productId === pr.id) sold += num_(it.qty); }); });
      var stock = bought - sold, avg = bought > 0 ? cost / bought : 0;
      invRows.push([ pr.name, pr.category || '', round2_(stock), pr.unit || '', round2_(bought),
        round2_(sold), round2_(avg), round2_((stock > 0 ? stock : 0) * avg) ]);
    });
    writeSheet_(ss, 'Inventory', invRows);

    // --- Products ---
    var prodRows = [['Name','Category','Unit','Colour','Image URL','ID']];
    (db.products || []).forEach(function (p) { prodRows.push([ p.name, p.category || '', p.unit || '', p.color || '', p.imageUrl || '', p.id ]); });
    writeSheet_(ss, 'Products', prodRows);

    // --- Credit Cards + transactions ---
    var cardRows = [['Card','Owner','Bank','Last 4','Credit Limit','Opening','Outstanding','Available','Status']];
    var cardTxns = [['Card','Date','Type','Amount','Note']];
    (db.cards || []).forEach(function (c) {
      var out = num_(c.openingOutstanding);
      (c.txns || []).forEach(function (t) { out += (t.type === 'purchase' ? num_(t.amount) : -num_(t.amount)); });
      cardRows.push([ c.name, c.owner || 'My own', c.bank || '', last4_(c.number), num_(c.creditLimit),
        num_(c.openingOutstanding), round2_(out), round2_(num_(c.creditLimit) - out), c.status || 'active' ]);
      (c.txns || []).forEach(function (t) { cardTxns.push([ c.name, t.date, up_(t.type), num_(t.amount), t.note || '' ]); });
    });
    writeSheet_(ss, 'Credit Cards', cardRows);
    writeSheet_(ss, 'Card Transactions', cardTxns);

    // --- Gift Cards + transactions ---
    var giftRows = [['Gift Card','Store','Last 4','Opening Balance','Balance','Status','ID']];
    var giftTxns = [['Gift Card','Date','Type','Amount','Note']];
    (db.giftcards || []).forEach(function (g) {
      var bal = num_(g.openingBalance);
      (g.txns || []).forEach(function (t) {
        var a = num_(t.amount);
        if (t.type === 'load' || t.type === 'adjust') bal += a; else if (t.type === 'spend') bal -= a;
      });
      giftRows.push([ g.name || '', g.store || '', last4_(g.number), num_(g.openingBalance), round2_(bal), g.status || 'active', g.id ]);
      (g.txns || []).forEach(function (t) { giftTxns.push([ g.name || g.id, t.date, up_(t.type), num_(t.amount), t.note || '' ]); });
    });
    writeSheet_(ss, 'Gift Cards', giftRows);
    writeSheet_(ss, 'Gift Transactions', giftTxns);

    // --- Cash entries ---
    var cashRows = [['Date','Direction','Amount','Category','Description','Whose Wallet']];
    (db.cash || []).slice().sort(byDateDesc_('date')).forEach(function (m) {
      cashRows.push([ m.date, m.dir, num_(m.amount), m.cat || '', m.desc || '', userName_(db.users, m.who) ]);
    });
    writeSheet_(ss, 'Cash', cashRows);

    // --- Activity log ---
    var actRows = [['When','By','Action','Entity','Ref','Detail']];
    (db.activity || []).slice().reverse().forEach(function (a) {
      actRows.push([ a.ts, a.byName || '', up_(a.action), a.entity || '', a.ref || '', a.detail || '' ]);
    });
    writeSheet_(ss, 'Activity Log', actRows);

    // --- Users ---
    var userRows = [['Name','Username','Phone','Role']];
    (db.users || []).forEach(function (u) { userRows.push([ u.name, u.username || '', u.phone || '', u.role || '' ]); });
    writeSheet_(ss, 'Users', userRows);

    // --- RAW JSON (for exact restore) ---
    // Split across cells so a huge JSON never hits the 50k-char-per-cell limit.
    var json = JSON.stringify(db);
    var chunks = chunk_(json, 45000);
    var rawRows = [['RAW DATABASE JSON — paste all parts in order into the app to restore exactly']];
    chunks.forEach(function (c, i) { rawRows.push(['part ' + (i + 1), c]); });
    writeSheet_(ss, 'RAW_JSON', rawRows);

    // remove Google's default empty first sheet
    var def = ss.getSheetByName('Sheet1');
    if (def && ss.getSheets().length > 1) ss.deleteSheet(def);
    SpreadsheetApp.flush();

    // export the Sheet as a real .xlsx and store it in the Drive folder
    var xlsx = exportAsXlsx_(ss.getId(), CONFIG.FILENAME_PREFIX + today_() + '.xlsx');
    var folder = getOrCreateFolder_(CONFIG.BACKUP_FOLDER_NAME);
    // replace an earlier file for the same day, if any
    var same = folder.getFilesByName(xlsx.getName());
    while (same.hasNext()) same.next().setTrashed(true);
    return folder.createFile(xlsx);
  } finally {
    DriveApp.getFileById(ss.getId()).setTrashed(true); // always clean up the temp Sheet
  }
}

/** Delete backups older than CONFIG.KEEP_DAYS. */
function pruneOldBackups_() {
  if (!CONFIG.KEEP_DAYS) return;
  var cutoff = new Date(Date.now() - CONFIG.KEEP_DAYS * 24 * 3600 * 1000);
  var files = getOrCreateFolder_(CONFIG.BACKUP_FOLDER_NAME).getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (f.getName().indexOf(CONFIG.FILENAME_PREFIX) === 0 && f.getDateCreated() < cutoff) f.setTrashed(true);
  }
}

/* ============================ HELPERS ===================================== */

function exportAsXlsx_(spreadsheetId, name) {
  var url = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/export?format=xlsx';
  var blob = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } }).getBlob();
  return blob.setName(name);
}
function getOrCreateFolder_(name) {
  if (CONFIG.BACKUP_FOLDER_ID) {
    try { return DriveApp.getFolderById(CONFIG.BACKUP_FOLDER_ID); }
    catch (e) { throw new Error('Cannot open BACKUP_FOLDER_ID "' + CONFIG.BACKUP_FOLDER_ID +
      '". Make sure the folder exists and this Google account can edit it. (' + e.message + ')'); }
  }
  var it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}
function writeSheet_(ss, name, rows) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  if (!rows || !rows.length) { sh.getRange(1, 1).setValue('(none)'); return; }
  var width = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 1);
  rows = rows.map(function (r) { while (r.length < width) r.push(''); return r; });
  sh.getRange(1, 1, rows.length, width).setValues(rows);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, width).setFontWeight('bold');
}
function buildProductLookup_(products) {
  var m = {}; (products || []).forEach(function (p) { m[p.id] = p.name; }); return m;
}
function itemNames_(items, lookup) {
  return (items || []).map(function (it) { return (lookup[it.productId] || 'Item') + ' ×' + num_(it.qty); }).join(', ');
}
function itemsGross_(items) { return (items || []).reduce(function (a, it) { return a + num_(it.qty) * num_(it.rate); }, 0); }
function itemsQty_(items) { return (items || []).reduce(function (a, it) { return a + num_(it.qty); }, 0); }
function payStatus_(total, paid) { total = num_(total); paid = num_(paid); return paid <= 0.0001 ? 'DUE' : (paid >= total - 0.0001 ? 'PAID' : 'PARTIAL'); }
function userName_(users, id) { var u = (users || []).filter(function (x) { return x.id === id; })[0]; return u ? u.name : (id ? 'Unassigned' : ''); }
function last4_(n) { n = (n || '').replace(/\s+/g, ''); return n ? ('•••• ' + n.slice(-4)) : ''; }
function num_(n) { return Number(n) || 0; }
function round2_(n) { return Math.round((Number(n) || 0) * 100) / 100; }
function up_(s) { return (s || '').toString().toUpperCase(); }
function count_(a) { return Array.isArray(a) ? a.length : 0; }
function byDateDesc_(key) { return function (a, b) { return (a[key] || '') < (b[key] || '') ? 1 : ((a[key] || '') > (b[key] || '') ? -1 : 0); }; }
function today_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
function chunk_(str, size) { var out = []; for (var i = 0; i < str.length; i += size) out.push(str.substr(i, size)); return out.length ? out : ['']; }
