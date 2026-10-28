/* ============================================================
   View: troubleshooting workspace
   Playbook list, the engine that walks a decision tree, hypothesis ranking and the ticket summary.
   ============================================================ */

// Troubleshoot landing page (list of playbooks).
function tList() {
    return `<h1>Troubleshooting</h1><p class="mu">Pick a playbook, or describe the problem on the Overview.</p>` + Object.entries(PB).map(([k, p]) => `<div class="box"><h2>${esc(p.t)}</h2><p class="sm mu">${Object.keys(p.n).filter(x => !p.n[x].res).length} diagnostic tests, ${Object.keys(p.n).filter(x => p.n[x].res).length} outcomes</p><a class="btn" style="text-decoration:none;display:inline-block" href="#/t/${k}/new">Start</a></div>`).join("");
}

// Replays the recorded answers through the playbook tree to find the current node.
function walk() {
    const p = PB[cur.pb];
    let id = "a";
    const path = [];
    for (const s of cur.hist) {
        const n = p.n[id], o = n.o[s.o];
        path.push({
            id, n, o
        });
        id = o.n;
    }
    return {
        id, path, node: p.n[id]
    };
}

// Re-ranks hypotheses from the recorded answers (uses the d: deltas on each option).
function scores() {
    const p = PB[cur.pb], { path } = walk(), sc = {};
    for (const k in p.h)
        sc[k] = p.h[k][1];
    path.forEach(x => {
        for (const k in x.o.d)
            sc[k] = Math.max(.2, sc[k] + x.o.d[k]);
    });
    const t = Object.values(sc).reduce((a, b) => a + b, 0);
    return Object.entries(sc).sort((a, b) => b[1] - a[1]).map(([k, v]) => [p.h[k][0], Math.round(v / t * 100)]);
}

// Builds the copyable ticket summary from the session. Only recorded facts are included.
function summary() {
    const p = PB[cur.pb], { path, node } = walk(), t = cur.title || p.t;
    return `Summary: ${t}\nStatus: ${node.res ? "Diagnosis reached (unverified until tested)" : "Investigation in progress"}\n\nTests and observed results:\n` + (path.length ? path.map((x, i) => `${i + 1}. ${x.n.q} -> ${x.o.e}`).join("\n") : "[no tests recorded]") + (node.res ? `\n\nAssessment: ${node.res} (${node.conf}).\nSuggested next steps:\n- ${node.steps.join("\n- ")}\nEscalate if: ${node.esc}` : "\n\nNext action: [complete the next test]") + "\n\nNote: results above are as reported by the analyst; assumptions are not confirmed facts.";
}

// DIAGNOSTIC WORKSPACE for one playbook session.
function diag() {
    const p = PB[cur.pb], { path, node } = walk(), sc = scores();
    const left = `<div class="box"><span class="sm mu">${esc(p.t)}</span><div class="row" style="margin:6px 0"><input id="ttl" aria-label="Incident title" placeholder="Incident title or reference (no personal data)" value="${esc(cur.title || "")}"></div></div>` +
        (node.res ? `<div class="box"><span class="tag ${node.esc ? "r1" : "r0"}">${esc(node.conf)}</span><h2 style="margin-top:8px">${esc(node.res)}</h2><ol>${node.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol><div class="warn sm"><b>Escalate when:</b> ${esc(node.esc)}</div><p class="sm mu">Verify the fix with the user before closing. Capture the evidence list in the ticket.</p></div>`
            : `<div class="box"><span class="tag r${node.risk}">${RK[node.risk]}</span> <span class="sm mu">Permissions: ${esc(node.perm)}</span><h2 style="margin-top:8px">${esc(node.q)}</h2><p class="sm">${esc(node.why)}</p><pre>${esc(node.cmd)}</pre><button class="btn g sm" data-copy="${esc(node.cmd)}">Copy</button><p class="sm mu">Illustrative guidance. Run it yourself and record what you actually see.</p>${node.o.map((o, i) => `<button class="opt" data-o="${i}">${esc(o.l)}</button>`).join("")}</div>`);
    const right = `<div class="box"><h2>Ranked hypotheses</h2><div class="hl">${sc.map(([n, v]) => `<span>${esc(n)}</span><b>${v}%</b><div class="bar" style="grid-column:1/3"><i style="width:${v}%"></i></div>`).join("")}</div><p class="sm mu">Relative weighting from your answers. Not a confirmed cause.</p></div>
<div class="box ev"><h2>Evidence and timeline</h2>${path.length ? `<ol>${path.map((x, i) => `<li>${esc(x.o.e)} <button data-rev="${i}">Revise from here</button></li>`).join("")}</ol>` : `<p class="sm mu">No results recorded yet.</p>`}</div>
<div class="row"><button class="btn" id="sv">Save session</button><button class="btn g" data-act="sp">Save as playbook</button><button class="btn g" id="bk" ${path.length ? "" : "disabled"}>Back</button><button class="btn g" id="rs">Restart</button></div>
${aiBox("hyp")}<div class="box"><h2>Ticket summary</h2><textarea id="sum" readonly style="min-height:190px">${esc(summary())}</textarea><button class="btn g" data-copy="${esc(summary())}">Copy summary</button></div>`;
    return `<h1>Diagnostic workspace</h1><div class="row" style="align-items:start"><div style="flex:1.4 1 360px">${left}</div><div style="flex:1 1 280px">${right}</div></div>`;
}
