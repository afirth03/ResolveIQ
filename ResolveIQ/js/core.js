/* ============================================================
   Core utilities and storage
   Small helpers ($, esc, toast, copy), the DB object and theme handling.
   Everything here loads first; other files depend on it.
   ============================================================ */

const $ = s => document.querySelector(s);

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

// Application state, persisted to localStorage under the key "riq".
let DB = {
    theme: "auto", sessions: [], recent: []
};

try {
    const x = JSON.parse(localStorage.getItem("riq") || "null");
    if (x && Array.isArray(x.sessions))
        DB = {
            ...DB, ...x
        };
}
catch (e) {
}

// Writes DB to localStorage. Call after changing any DB field.
const save = () => {
    try {
        localStorage.setItem("riq", JSON.stringify(DB));
    }
    catch (e) {
    }
};

const theme = () => {
    if (DB.theme === "auto")
        document.documentElement.removeAttribute("data-theme");
    else
        document.documentElement.setAttribute("data-theme", DB.theme);
};

theme();

const toast = m => {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = m;
    document.body.append(t);
    setTimeout(() => t.remove(), 1800);
};

const copy = async (t) => {
    try {
        await navigator.clipboard.writeText(t);
        toast("Copied");
    }
    catch (e) {
        toast("Copy blocked by browser; select the text manually");
    }
};

DB.skills = DB.skills || {};
DB.lab = DB.lab || {};
DB.tk = DB.tk || {};
DB.iv = DB.iv || {};
DB.pl = DB.pl || [];
