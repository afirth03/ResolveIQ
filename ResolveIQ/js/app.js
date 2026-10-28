/* ============================================================
   App shell and router
   Sidebar, URL routing, render() and event wiring.
   Loaded last. The final render() call starts the app.
   ============================================================ */

// SIDEBAR. Add a page by adding [hash, label] here, a route in render(), and a view function.
const NAV = [
    ["#/", "Overview"], ["#/t", "Troubleshoot"], ["#/kb", "Knowledge base"], ["#/cmd", "Commands"], ["#/ticket", "Ticket writer"], ["#/sim", "Ticket simulator"], ["#/lab", "Labs"], ["#/skills", "Skills matrix"], ["#/career", "Career"], ["#/iv", "Interviews"], ["#/pb", "My playbooks"], ["#/progress", "Progress"], ["#/ai", "AI assistant"], ["#/set", "Settings"]
];

let cur = null, filt = {
    q: "", r: "all"
};

// Splits the URL hash into parts, for example "#/t/net" -> ["#","t","net"].
const route = () => (location.hash || "#/").split("/");

// Draws the sidebar and highlights the current page.
function shell() {
    const h = location.hash || "#/";
    $("#nav").innerHTML = `<div class="logo">Resolve<b>IQ</b></div>` + NAV.map(([a, l]) => `<a href="${a}" class="${(h === a || h.startsWith(a + "/")) ? "on" : ""}">${l}</a>`).join("") + `<small>Ctrl or Cmd + K to search</small>`;
}

// Scores playbooks against the free-text diagnosis search.
function match(q) {
    const w = q.toLowerCase().split(/\W+/).filter(x => x.length > 2);
    return Object.entries(PB).map(([k, p]) => [k, w.reduce((s, x) => s + (p.kw.includes(x) || p.t.toLowerCase().includes(x) ? 1 : 0), 0)]).sort((a, b) => b[1] - a[1]);
}

// ROUTER. Chooses the view for the current URL hash and draws it.
function render() {
    shell();
    const r = route(), a = $("#app");
    let h;
    if (r[1] === "t" && r[2] && PB[r[2]]) {
        if (!cur || cur.pb !== r[2] || r[3] === "new") {
            if (r[3] && r[3][0] === "r") {
                const s = DB.sessions.find(x => "r" + x.id === r[3]);
                cur = s ? {
                    pb: s.pb, hist: [...s.hist], title: s.title, id: s.id
                } : {
                    pb: r[2], hist: []
                };
            }
            else
                cur = {
                    pb: r[2], hist: []
                };
            if (r[3])
                history.replaceState(null, "", "#/t/" + r[2]);
        }
        h = diag();
    }
    else if (r[1] === "t")
        h = tList();
    else if (r[1] === "cmd")
        h = cmdv();
    else if (r[1] === "kb")
        h = kbv();
    else if (r[1] === "lab")
        h = labv();
    else if (r[1] === "sim")
        h = simv();
    else if (r[1] === "skills")
        h = skv();
    else if (r[1] === "career")
        h = crv();
    else if (r[1] === "iv")
        h = ivv();
    else if (r[1] === "pb")
        h = plv();
    else if (r[1] === "progress")
        h = prv();
    else if (r[1] === "ai")
        h = aiv();
    else if (r[1] === "ticket")
        h = tick();
    else if (r[1] === "set")
        h = sett();
    else
        h = home();
    a.innerHTML = h;
    bind();
    document.title = "ResolveIQ";
}

// Attaches event handlers after each render.
function bind() {
    const A = $("#app");
    $("#qf")?.addEventListener("submit", e => {
        e.preventDefault();
        const q = $("#q").value.trim();
        if (!q) {
            toast("Describe the problem first");
            return;
        }
        const m = match(q);
        if (!m[0][1]) {
            toast("No close playbook. Choose one below.");
            return;
        }
        cur = null;
        location.hash = "#/t/" + m[0][0] + "/new";
    });
    A.querySelectorAll("[data-copy]").forEach(b => b.onclick = () => copy(b.dataset.copy));
    A.querySelectorAll("[data-o]").forEach(b => b.onclick = () => {
        cur.hist.push({ o: +b.dataset.o });
        render();
    });
    A.querySelectorAll("[data-rev]").forEach(b => b.onclick = () => {
        cur.hist = cur.hist.slice(0, +b.dataset.rev);
        render();
    });
    $("#bk")?.addEventListener("click", () => {
        cur.hist.pop();
        render();
    });
    $("#rs")?.addEventListener("click", () => {
        cur.hist = [];
        render();
    });
    $("#ttl")?.addEventListener("input", e => {
        cur.title = e.target.value;
        $("#sum").value = summary();
    });
    $("#sv")?.addEventListener("click", () => {
        cur.id = cur.id || Date.now();
        DB.sessions = DB.sessions.filter(s => s.id !== cur.id);
        DB.sessions.unshift({
            id: cur.id, pb: cur.pb, hist: [...cur.hist], title: cur.title || "", ts: Date.now()
        });
        DB.sessions = DB.sessions.slice(0, 30);
        save();
        toast("Session saved");
    });
    $("#cq")?.addEventListener("input", e => {
        filt.q = e.target.value;
        const p = e.target.selectionStart;
        render();
        const i = $("#cq");
        i.focus();
        i.setSelectionRange(p, p);
    });
    $("#cr")?.addEventListener("change", e => {
        filt.r = e.target.value;
        render();
    });
    if ($("#fs") || $("#out")) {
        const u = () => $("#out").value = ticketOut();
        A.querySelectorAll("[data-f]").forEach(t => t.oninput = u);
        u();
        $("#cp").onclick = () => copy($("#out").value);
    }
    if ($("#th")) {
        $("#th").value = DB.theme;
        $("#th").onchange = e => {
            DB.theme = e.target.value;
            theme();
            save();
        };
        $("#ex").onclick = () => {
            const b = new Blob([JSON.stringify(DB, null, 2)], { type: "application/json" }), a = document.createElement("a");
            a.href = URL.createObjectURL(b);
            a.download = "resolveiq-backup.json";
            a.click();
        };
        $("#im").onclick = () => $("#fi").click();
        $("#fi").onchange = async (e) => {
            try {
                const x = JSON.parse(await e.target.files[0].text());
                if (!Array.isArray(x.sessions) || !x.sessions.every(s => PB[s.pb] && Array.isArray(s.hist) && s.hist.every(h => Number.isInteger(h.o))))
                    throw 0;
                DB = {
                    theme: ["auto", "light", "dark"].includes(x.theme) ? x.theme : "auto", sessions: x.sessions.slice(0, 30).map(s => ({
                        id: +s.id || Date.now(), pb: s.pb, hist: s.hist.map(h => ({ o: h.o })), title: String(s.title || "").slice(0, 120), ts: +s.ts || Date.now()
                    })), recent: []
                };
                save();
                theme();
                toast("Backup imported");
                render();
            }
            catch (err) {
                toast("Import failed: file is not a valid ResolveIQ backup");
            }
        };
        $("#rd").onclick = () => {
            if (confirm("Delete all saved sessions and preferences from this browser?")) {
                DB = {
                    theme: "auto", sessions: [], recent: []
                };
                save();
                theme();
                render();
            }
        };
    }
}

addEventListener("hashchange", () => {
    cur = route()[2] === cur?.pb ? cur : null;
    render();
});

addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (location.hash !== "#/" && location.hash !== "")
            location.hash = "#/";
        else
            render();
        setTimeout(() => $("#q")?.focus(), 0);
    }
});

render();
