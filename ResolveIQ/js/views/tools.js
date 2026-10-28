/* ============================================================
   Views: command explorer and ticket writer
   Command search/filter page and the ticket writer.
   ============================================================ */

// COMMAND EXPLORER page.
function cmdv() {
    const l = CMD.filter(c => (filt.r === "all" || c[2] == filt.r) && (c.join(" ").toLowerCase().includes(filt.q.toLowerCase())));
    return `<h1>Command explorer</h1><p class="mu">Reference only. Commands are never executed from this page. Check risk before running anything.</p><div class="row"><input id="cq" placeholder="Search commands, purposes, outputs..." value="${esc(filt.q)}"><select id="cr" aria-label="Risk filter" style="flex:0 0 200px"><option value="all">All risk levels</option>${RK.map((r, i) => `<option value="${i}" ${String(filt.r) === String(i) ? "selected" : ""}>${r}</option>`).join("")}</select></div>` + (l.length ? l.map(c => `<div class="box"><span class="tag r${c[2]}">${RK[c[2]]}</span> <b>${esc(c[0])}</b><p class="sm" style="margin:6px 0">${esc(c[1])}</p><p class="sm"><b>Reading the result:</b> ${esc(c[4])}</p><p class="sm mu">Permissions: ${esc(c[3])}. Related: ${esc(c[5])}</p><button class="btn g sm" data-copy="${esc(c[0])}">Copy</button></div>`).join("") : `<div class="box mu">No commands match. Clear the filter or try a broader term.</div>`);
}

// TICKET WRITER page.
function tick() {
    return `<h1>Ticket writer</h1><p class="mu">Enter only what happened. Blank fields stay as visible placeholders, so nothing is invented.</p><div class="row" style="align-items:start"><div class="box">${[
        ["s", "Summary"], ["r", "What the user reported"], ["i", "Impact (who, what, how urgent)"], ["d", "Steps performed"], ["x", "Results and evidence"], ["n", "Next action"]
    ].map(([k, l]) => `<label for="f${k}">${l}</label><textarea id="f${k}" data-f="${k}"></textarea>`).join("")}</div><div class="box"><h2>Preview</h2><textarea id="out" readonly style="min-height:320px"></textarea><div class="row"><button class="btn" id="cp">Copy ticket</button></div><p class="sm mu">Before: "printer broke, fixed it". After: state the symptom, what you checked, what you observed and what changed.</p></div></div>`;
}

function ticketOut() {
    const g = k => (document.getElementById("f" + k)?.value || "").trim() || "[not recorded]";
    return `SUMMARY\n${g("s")}\n\nUSER REPORT\n${g("r")}\n\nIMPACT\n${g("i")}\n\nTROUBLESHOOTING PERFORMED\n${g("d")}\n\nRESULTS AND EVIDENCE\n${g("x")}\n\nNEXT ACTION\n${g("n")}`;
}
