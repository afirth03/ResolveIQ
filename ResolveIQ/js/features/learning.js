/* ============================================================
   Feature: knowledge base, labs, simulator, skills, careers, interviews
   Views and event handlers for the learning pages. State variables (kbq, lb, sm, ...) are declared first.
   ============================================================ */

let kbq = "", kbo = null, lb = null, lbLog = [], sm = null, sa = [], ivr = {};
const par = t => t.split("\n").map(p => `<div class="box">${esc(p)}</div>`).join("");

// KNOWLEDGE BASE views.
const kbv = () => {
    if (kbo != null) {
        const a = KB[kbo];
        return `<button class="btn g" data-act="kbx">Back</button><h1>${esc(a[0])}</h1><p class="sm mu">${a[1]}. Verify details against Microsoft Learn or vendor documentation.</p>` + par(a[2]);
    }
    const l = KB.map((a, i) => [a, i]).filter(([a]) => a.join(" ").toLowerCase().includes(kbq.toLowerCase()));
    return `<h1>Knowledge base</h1><input id="kq" aria-label="Search" placeholder="Search articles" value="${esc(kbq)}">` + (l.length ? l.map(([a, i]) => `<button class="opt" data-act="kb:${i}"><b>${esc(a[0])}</b> <span class="sm mu">${a[1]}</span></button>`).join("") : `<div class="box mu">No articles match. Clear the search.</div>`);
};

// LABS views.
const labv = () => {
    if (lb == null)
        return `<h1>Interactive labs</h1><p class="mu">Deterministic simulations. They never inspect your real device.</p>` + LB.map((l, i) => `<button class="opt" data-act="lb:${i}"><b>${l.t}</b> ${DB.lab[i] ? `<span class="tag r0">Complete</span>` : ""}<br><span class="sm mu">${l.g}</span></button>`).join("");
    const l = LB[lb];
    return `<button class="btn g" data-act="lbx">Back</button><h1>${l.t}</h1><p>${l.g}</p><div class="warn sm">Simulated output. Supported commands: ${Object.keys(l.c).map(esc).join(" · ")}</div><form id="lf" class="row"><input id="lt" aria-label="Command" placeholder="Type a supported command" autocomplete="off"><button class="btn" style="flex:0 0 auto">Run</button></form><pre>${esc(lbLog.join("\n\n") || "No commands run yet.")}</pre><div class="box"><h2>${l.q}</h2>${l.o.map((o, i) => `<button class="opt" data-act="ans:${i}">${esc(o)}</button>`).join("")}</div>`;
};

// TICKET SIMULATOR views.
const simv = () => {
    if (sm == null)
        return `<h1>Ticket simulator</h1><p class="mu">Priority comes from impact and urgency; they are not interchangeable.</p>` + SC.map((s, i) => `<button class="opt" data-act="sm:${i}"><b>${s.t}</b> ${DB.tk[i] != null ? `<span class="tag r0">Best ${DB.tk[i]}%</span>` : ""}<br><span class="sm mu">${s.d}</span></button>`).join("");
    const s = SC[sm], n = sa.length;
    if (n >= s.qs.length) {
        const tot = s.qs.reduce((a, q) => a + 2, 0), got = sa.reduce((a, o, i) => a + s.qs[i][1][o][1], 0);
        return `<h1>${s.t}: result</h1><div class="box"><h2>${Math.round(got / tot * 100)}%</h2>${sa.map((o, i) => `<p class="sm"><b>${esc(s.qs[i][0])}</b> ${esc(s.qs[i][1][o][2])}</p>`).join("")}</div><button class="btn g" data-act="smx">Back to scenarios</button>`;
    }
    const q = s.qs[n];
    return `<button class="btn g" data-act="smx">Exit</button><h1>${s.t}</h1><p>${s.d}</p><div class="box"><h2>${esc(q[0])}</h2>${q[1].map((o, i) => `<button class="opt" data-act="pk:${i}">${esc(o[0])}</button>`).join("")}</div>`;
};

// SKILLS MATRIX view.
const skv = () => `<h1>Skills matrix</h1><p class="mu">Levels are self-assessed. Completing labs does not prove job readiness; record real evidence.</p>` + Object.entries(SKG).map(([g, l]) => `<div class="box"><h2>${g}</h2>${l.map(n => {
    const v = DB.skills[n] || {
        l: 0, t: 0
    }, gap = v.t > v.l;
    const sel = (k, x) => `<select data-sk="${n}|${k}" aria-label="${esc(n)} ${k == "l" ? "current" : "target"}" style="width:90px">${[0, 1, 2, 3, 4, 5].map(i => `<option ${i === x ? "selected" : ""}>${i}</option>`).join("")}</select>`;
    return `<div class="row" style="align-items:center;margin:4px 0"><span>${n} ${gap ? `<span class="tag r1">Gap ${v.t - v.l}</span>` : ""}</span><span class="sm mu" style="flex:0 0 auto">Now ${sel("l", v.l)} Target ${sel("t", v.t)}</span></div>`;
}).join("")}</div>`).join("");

// CAREER view.
const crv = () => `<h1>Career pathways</h1><div class="warn sm">Certifications are optional and role-dependent, and do not replace hands-on experience. Check current names and availability with the issuing body.</div>` + CR.map(c => `<div class="box"><h2>${c[0]}</h2><p class="sm"><b>Focus:</b> ${c[1]}</p><p class="sm"><b>Certifications:</b> ${c[2]}</p><p class="sm"><b>Project:</b> ${c[3]}</p></div>`).join("");

// INTERVIEW PRACTICE view.
const ivv = () => `<h1>Interview practice</h1><p class="mu">Write your answer, reveal the model answer and compare. Answers stay in this browser.</p>` + IV.map((q, i) => `<div class="box"><h2>${esc(q[0])}</h2><textarea data-iv="${i}" aria-label="Your answer">${esc(DB.iv[i] || "")}</textarea><button class="btn g sm" data-act="rv:${i}">${ivr[i] ? "Hide" : "Reveal"} model answer</button>${ivr[i] ? `<p class="sm"><b>Model:</b> ${esc(q[1])}</p><p class="sm mu">Did you cover scope, sequence, interpretation, security, communication and escalation?</p>` : ""}</div>`).join("");

document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b)
        return;
    const [a, v] = b.dataset.act.split(":"), x = +v;
    if (a === "kb")
        kbo = x;
    else if (a === "kbx")
        kbo = null;
    else if (a === "lb") {
        lb = x;
        lbLog = [];
    }
    else if (a === "lbx")
        lb = null;
    else if (a === "ans") {
        if (x === LB[lb].a) {
            DB.lab[lb] = 1;
            save();
            lbLog.push("Correct. " + LB[lb].x);
        }
        else
            lbLog.push("Not quite. Re-check the command output and try again.");
    }
    else if (a === "sm") {
        sm = x;
        sa = [];
    }
    else if (a === "smx")
        sm = null;
    else if (a === "pk") {
        sa.push(x);
        const s = SC[sm];
        if (sa.length >= s.qs.length) {
            const tot = s.qs.length * 2, got = sa.reduce((t, o, i) => t + s.qs[i][1][o][1], 0), p = Math.round(got / tot * 100);
            DB.tk[sm] = Math.max(DB.tk[sm] || 0, p);
            save();
        }
    }
    else if (a === "rv")
        ivr[x] = !ivr[x];
    render();
});

document.addEventListener("submit", e => {
    if (e.target.id !== "lf")
        return;
    e.preventDefault();
    const c = $("#lt").value.trim().toLowerCase().replace(/\s+/g, " "), o = LB[lb].c[c];
    lbLog.push("> " + c + "\n" + (o || "Not supported in this simulation. Try one of the listed commands."));
    render();
    $("#lt")?.focus();
});

document.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.iv != null) {
        DB.iv[t.dataset.iv] = t.value.slice(0, 4000);
        save();
    }
    else if (t.id === "kq") {
        kbq = t.value;
        const p = t.selectionStart;
        render();
        const i = $("#kq");
        i.focus();
        i.setSelectionRange(p, p);
    }
});

document.addEventListener("change", e => {
    const s = e.target.dataset.sk;
    if (!s)
        return;
    const [n, k] = s.split("|");
    DB.skills[n] = DB.skills[n] || {
        l: 0, t: 0
    };
    DB.skills[n][k] = +e.target.value;
    save();
    render();
});
