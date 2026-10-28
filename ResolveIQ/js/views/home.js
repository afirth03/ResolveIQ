/* ============================================================
   View: home page
   The dashboard: hero, quick diagnosis, tiles, playbook library.
   ============================================================ */

// Playbook groups shown on the home page. Add a new playbook id to a group to list it.
const HC = [
    [`Networking`, [`net`, `dh`, `vpn`]], [`Identity and access`, [`win`, `mfa`, `gpo`, `dj`]], [`Microsoft 365`, [`out`, `olk`, `od`, `smb`, `teams`]], [`Endpoint and hardware`, [`slow`, `bsod`, `wu`, `mon`, `chg`, `prn`]], [`Enterprise and security`, [`int`, `blk`, `secx`]]
];

// HOME PAGE. Edit the hero text, tiles and sections here. Styles live in css/styles.css (.hero, .tile, .stat).
function home() {
    const hr = new Date().getHours(), gr = hr < 12 ? `Good morning` : hr < 18 ? `Good afternoon` : `Good evening`, s0 = DB.sessions[0], nl = LB.findIndex((_, i) => !DB.lab[i]), ns = SC.findIndex((_, i) => DB.tk[i] == null), gap = Object.entries(DB.skills).filter(([, v]) => v.t > v.l).sort((a, b) => (b[1].t - b[1].l) - (a[1].t - a[1].l))[0];
    const tile = (h, t, d) => `<a class="tile" href="${h}"><b>${t}</b><span>${d}</span></a>`;
    return `<section class="hero"><div class="eyebrow">IT support intelligence</div><h1>${gr}. What needs resolving?</h1><p>Resolve incidents with confidence. Learn how systems work. Build the skills to move forward.</p><form id="qf"><div class="row"><input id="q" aria-label="Describe the problem" placeholder="Describe the IT problem you're trying to solve..." autocomplete="off"><button class="btn" style="flex:0 0 auto">Start diagnosis</button></div></form><div>${[
        `Outlook keeps asking for my password`, `Laptop connects to Wi-Fi but no internet`, `A user cannot sign in to Windows`, `A shared printer is offline`, `Teams cannot detect a microphone`, `A device is not appearing in Intune`
    ].map(q => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div><div class="stat"><div><b>${Object.keys(PB).length}</b>Playbooks</div><div><b>${CMD.length}</b>Commands</div><div><b>${KB.length}</b>Articles</div><div><b>${LB.length}</b>Labs</div><div><b>${SC.length}</b>Scenarios</div></div></section>
<div class="sec">Start here</div><div class="tiles">${tile(`#/t/net/new`, `Diagnose a network issue`, `Gateway, DNS and connectivity`)}${tile(`#/t/win/new`, `Investigate a sign-in problem`, `Lockouts, passwords, trust`)}${tile(`#/t/slow/new`, `Check a device`, `Performance and disk health`)}${tile(`#/ticket`, `Write a professional ticket`, `Facts only, nothing invented`)}${tile(`#/pb`, `Open a saved playbook`, `${DB.pl.length} personal playbooks`)}${tile(`#/sim`, `Practise a support scenario`, `Scored decision-making`)}</div>
<div class="row"><div class="box"><h2>Continue where you left off</h2>${s0 ? `<a class="opt" href="#/t/${s0.pb}/r${s0.id}"><b>${esc(PB[s0.pb].t)}</b><br><span class="sm mu">${esc(s0.title || "Untitled session")} · ${new Date(s0.ts).toLocaleString("en-GB")}</span></a>` : `<p class="sm mu">No saved sessions yet. Save one from the diagnostic workspace and it will appear here.</p>`}<a class="sm" href="#/progress">View progress</a></div>
<div class="box"><h2>Suggested practice</h2>${nl >= 0 ? `<a class="opt" href="#/lab">Lab: ${LB[nl].t}</a>` : `<p class="sm mu">All labs completed.</p>`}${ns >= 0 ? `<a class="opt" href="#/sim">Scenario: ${SC[ns].t}</a>` : ``}${gap ? `<p class="sm">Largest self-assessed gap: <b>${esc(gap[0])}</b></p>` : `<p class="sm mu">Set targets in the <a href="#/skills">skills matrix</a> to get gap-based suggestions.</p>`}</div></div>
<div class="sec">Playbook library</div><div class="box">${HC.map(([n, ids]) => `<div class="pl"><b class="sm">${n}</b><br>${ids.filter(i => PB[i]).map(i => `<a href="#/t/${i}/new">${esc(PB[i].t)}</a>`).join("")}</div>`).join(`<div style="height:10px"></div>`)}</div>
<div class="sec">How ResolveIQ works</div><div class="pr"><div><b>Read-only first</b>Every step is risk-labelled with the permissions it needs. Nothing runs automatically.</div><div><b>Evidence before conclusions</b>Causes are ranked from your results and never presented as confirmed without evidence.</div><div><b>Simulated is never live</b>Labs and sample output are illustrative. Nothing touches your device.</div><div><b>Local-first</b>Your data stays in this browser. AI assistance is optional and clearly labelled.</div></div><p class="sm mu" style="margin-top:20px">Guidance for trained support staff. Follow your organisation's procedures and escalate when unsure.</p>`;
}

document.addEventListener(`click`, e => {
    const c = e.target.closest(`[data-q]`);
    if (!c)
        return;
    $(`#q`).value = c.dataset.q;
    $(`#qf`).requestSubmit();
});
