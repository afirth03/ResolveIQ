/* ============================================================
   View: settings and data
   Theme, import/export and reset.
   ============================================================ */

// SETTINGS page: theme, import/export, reset.
function sett() {
    return `<h1>Settings and data</h1><div class="box"><label for="th">Theme</label><select id="th"><option value="auto">Match system</option><option value="light">Light</option><option value="dark">Dark</option></select></div>
<div class="box"><h2>Where your data lives</h2><p class="sm">Preferences and saved sessions are stored in this browser only (local storage). Nothing is sent anywhere. Do not record passwords, tokens or personal data.</p><div class="row"><button class="btn g" data-act="cj">Copy backup JSON</button><button class="btn g" id="ex">Download JSON</button><button class="btn g" id="im">Import backup</button><button class="btn g" id="rd">Reset all data</button></div><input type="file" id="fi" accept="application/json" hidden></div>
<div class="box"><h2>AI assistance</h2><p class="sm mu">${S ? `Available in this view through Claude. Input limited to 2000 characters, obvious secrets blocked, 25 requests per session. Output is a hypothesis and is never executed.` : `Not available in this view. Every other feature works without it.`}</p></div>`;
}
