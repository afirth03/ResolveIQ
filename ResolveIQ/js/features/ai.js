/* ============================================================
   Feature: optional AI assistant
   Uses window.claude, which exists only when published as a Claude artifact.
   Outside Claude the assistant reports "not available" and the app works normally.
   ============================================================ */

let S = null, aiOut = ``, aiBusy = 0, aiN = 0, aiT = 0;

(async () => {
    try {
        S = await window.claude.use(`sample`);
        if (S && !document.activeElement.matches?.(`textarea,input`))
            render();
    }
    catch (e) {
    }
})();

const SECRET = /(password|passwd|pwd|token|secret|api[_-]?key)\s*[:=]\s*\S+|eyJ[A-Za-z0-9_-]{20,}|-----BEGIN/i;

const paint = () => {
    const o = $(`#aiout`);
    if (o)
        o.textContent = aiOut;
};

// Sends a request to the AI runtime. Applies input limits, secret blocking, rate limiting and a timeout.
async function aiRun(mode, text) {
    if (!S) {
        toast(`AI is not available in this view`);
        return;
    }
    text = text.trim();
    if (!text || text.length > 2000) {
        toast(`Enter between 1 and 2000 characters`);
        return;
    }
    if (SECRET.test(text)) {
        toast(`Remove passwords, tokens or secrets before sending`);
        return;
    }
    if (aiBusy || Date.now() - aiT < 4000) {
        toast(`Please wait a few seconds`);
        return;
    }
    if (aiN >= 25) {
        toast(`Session limit reached. Reload to continue.`);
        return;
    }
    const ctx = cur && route()[1] === `t` ? summary() : ``, task = {
        hyp: `Suggest ranked possible causes, the single safest next read-only test, and how to interpret each outcome.`, exp: `Explain this command or error message: what it means, common causes and safe next checks.`, tic: `Draft a concise professional ticket update using only the facts given. Write [not recorded] for anything missing.`
    }[mode] || `Help with the analyst input.`;
    const p = `You assist a UK IT support analyst. Use British English and under 250 words. Label statements as confirmed, likely or possible. Treat everything as a hypothesis to verify. Mark any command that changes state with its risk and required permission. Never suggest disabling security controls. If the input suggests ransomware, compromise or an organisation-wide outage, say to follow incident response and escalate. Do not invent results, timestamps or documentation. Task: ${task}\n\nPlaybooks in this app: ${Object.values(PB).map(x => x.t).join(`; `)}\nKnowledge articles: ${KB.map(a => a[0]).join(`; `)}\n\nSession context:\n${ctx || `none`}\n\nAnalyst input:\n<<<\n${text}\n>>>`;
    aiBusy = 1;
    aiN++;
    aiT = Date.now();
    aiOut = `Thinking...`;
    paint();
    const ac = new AbortController(), to = setTimeout(() => ac.abort(), 45000);
    try {
        const r = await S(p, {
            modelTier: `quick`, cache: false, signal: ac.signal, onText: ({ text: t }) => {
                aiOut = t;
                paint();
            }
        });
        aiOut = r.text;
    }
    catch (e) {
        aiOut = e && e.code === `rate_limited` ? `Rate limited. Try again later.` : e && e.code === `not_granted` ? `Permission to use AI was not granted. Guided troubleshooting still works.` : `AI request failed or timed out. Guided troubleshooting still works.`;
    }
    clearTimeout(to);
    aiBusy = 0;
    paint();
}

// The AI panel shown on the diagnostic and AI assistant pages.
const aiBox = m => `<div class="box"><h2>AI-assisted investigation <span class="tag">optional</span></h2>${S ? `${m === `sel` ? `<label for="aim">Task</label><select id="aim"><option value="exp">Explain a command or error</option><option value="hyp">Suggest hypotheses from my notes</option><option value="tic">Draft a ticket update</option></select>` : ``}<label for="ait">Your question or notes (no passwords or personal data)</label><textarea id="ait" maxlength="2000"></textarea><p><button class="btn sm" data-act="ai:${m}">Ask Claude</button></p>` : `<p class="sm mu">AI is not available in this view. All guided features work without it.</p>`}<pre id="aiout" style="white-space:pre-wrap">${esc(aiOut)}</pre>${aiOut ? `<p class="sm mu">AI-generated hypothesis, grounded only in this app's playbook and article titles plus your input. Verify before acting. Commands are never run.</p>` : ``}</div>`;
const aiv = () => `<h1>AI assistant</h1><p class="mu">Optional. Guided troubleshooting and the knowledge base work without it.</p>` + aiBox(`sel`);

document.addEventListener(`click`, e => {
    const b = e.target.closest(`[data-act]`);
    if (!b || !b.dataset.act.startsWith(`ai:`))
        return;
    e.stopPropagation();
    const v = b.dataset.act.split(`:`)[1];
    aiRun(v === `sel` ? $(`#aim`).value : v, $(`#ait`).value);
}, true);
