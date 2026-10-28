/* ============================================================
   Feature: personal playbooks and progress
   My playbooks page (create, favourite, duplicate, import, export) and the Progress page.
   ============================================================ */

let plq = "";

const addPl = (t, g, s) => {
    DB.pl.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000), title: t.slice(0, 120), tags: g, steps: s.slice(0, 8000), fav: 0
    });
    DB.pl = DB.pl.slice(0, 100);
    save();
};

const plmd = p => `# ${p.title}\n\nTags: ${p.tags.join(", ")}\n\n${p.steps}`;

// MY PLAYBOOKS page.
const plv = () => {
    const l = DB.pl.filter(p => (p.title + p.tags.join(" ") + p.steps).toLowerCase().includes(plq.toLowerCase())).sort((a, b) => b.fav - a.fav);
    return `<h1>My playbooks</h1><div class="warn sm">Keep notes generic. Do not store passwords, tokens, personal data or confidential internal documents here. This is a browser-only store.</div><div class="box"><h2>New playbook</h2><form id="plf"><label for="pt">Title</label><input id="pt" required maxlength="120"><label for="pg">Tags (comma separated)</label><input id="pg"><label for="ps">Steps, checks and commands</label><textarea id="ps" style="min-height:120px" required></textarea><p><button class="btn">Save playbook</button></p></form></div><input id="pq" aria-label="Search playbooks" placeholder="Search playbooks" value="${esc(plq)}">` + (l.length ? l.map(p => `<div class="box"><h2>${p.fav ? "★ " : ""}${esc(p.title)}</h2><p class="sm mu">${esc(p.tags.join(", ") || "no tags")}</p><pre style="white-space:pre-wrap">${esc(p.steps)}</pre><div class="row"><button class="btn g sm" data-act="pf:${p.id}">${p.fav ? "Unfavourite" : "Favourite"}</button><button class="btn g sm" data-act="pd:${p.id}">Duplicate</button><button class="btn g sm" data-act="pm:${p.id}">Copy Markdown</button><button class="btn g sm" data-act="px:${p.id}">Delete</button></div></div>`).join("") : `<div class="box mu">No playbooks yet. Create one above or save a diagnostic session as a playbook.</div>`) + `<div class="box"><h2>Import and export</h2><button class="btn g sm" data-act="pj:0">Copy all as JSON</button><label for="pi">Paste JSON to import</label><textarea id="pi"></textarea><p><button class="btn g sm" data-act="pi:0">Import</button></p></div>`;
};

// PROGRESS page.
const prv = () => {
    const sk = Object.entries(DB.skills).filter(([, v]) => v.t > v.l).sort((a, b) => (b[1].t - b[1].l) - (a[1].t - a[1].l)), nl = LB.findIndex((_, i) => !DB.lab[i]);
    return `<h1>Progress</h1><div class="row"><div class="box"><h2>Demonstrated</h2><p class="sm">Labs completed: ${Object.keys(DB.lab).length} of ${LB.length}</p><p class="sm">Simulator best: ${Object.keys(DB.tk).length ? Object.entries(DB.tk).map(([i, v]) => esc(SC[i].t) + " " + v + "%").join("; ") : "none yet"}</p><p class="sm">Saved diagnostic sessions: ${DB.sessions.length}</p></div><div class="box"><h2>Self-assessed</h2><p class="sm">Skills rated: ${Object.keys(DB.skills).length}</p><p class="sm">Interview answers written: ${Object.values(DB.iv).filter(Boolean).length}</p><p class="sm">Personal playbooks: ${DB.pl.length}</p></div></div><div class="box"><h2>Suggested next</h2>${nl >= 0 ? `<a class="opt" href="#/lab">Lab: ${LB[nl].t}</a>` : ""}${sk[0] ? `<p class="sm">Largest self-assessed gap: ${esc(sk[0][0])}. Practise it, then record real evidence.</p>` : `<p class="sm mu">Set targets in the skills matrix to see gaps.</p>`}</div><p class="sm mu">Self-assessment is not proof of ability, and completing content does not mean you are job-ready.</p>`;
};

document.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b)
        return;
    const [a, v] = b.dataset.act.split(":"), x = +v, p = DB.pl.find(q => q.id === x);
    let rr = 1;
    if (a === "sp") {
        addPl(cur.title || PB[cur.pb].t, [cur.pb], summary());
        toast("Saved to My playbooks");
        rr = 0;
    }
    else if (a === "pf" && p) {
        p.fav = p.fav ? 0 : 1;
        save();
    }
    else if (a === "px" && p) {
        DB.pl = DB.pl.filter(q => q !== p);
        save();
    }
    else if (a === "pd" && p)
        addPl(p.title + " (copy)", p.tags, p.steps);
    else if (a === "pm" && p) {
        copy(plmd(p));
        rr = 0;
    }
    else if (a === "pj") {
        copy(JSON.stringify(DB.pl, null, 2));
        rr = 0;
    }
    else if (a === "cj") {
        copy(JSON.stringify(DB, null, 2));
        rr = 0;
    }
    else if (a === "pi") {
        try {
            const r = JSON.parse($("#pi").value);
            if (!Array.isArray(r) || r.some(q => typeof q.title !== "string" || typeof q.steps !== "string"))
                throw 0;
            r.slice(0, 100).forEach(q => addPl(q.title, Array.isArray(q.tags) ? q.tags.map(String).slice(0, 10) : [], q.steps));
            toast("Imported");
        }
        catch (err) {
            toast("Import failed: invalid playbook JSON");
            rr = 0;
        }
    }
    else
        return;
    if (rr)
        render();
}, true);

document.addEventListener("submit", e => {
    if (e.target.id !== "plf")
        return;
    e.preventDefault();
    addPl($("#pt").value.trim(), $("#pg").value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 10), $("#ps").value);
    toast("Playbook saved");
    render();
});

document.addEventListener("input", e => {
    const t = e.target;
    if (t.id === "pq") {
        plq = t.value;
        const p = t.selectionStart;
        render();
        const i = $("#pq");
        i.focus();
        i.setSelectionRange(p, p);
    }
});
