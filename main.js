// ====== Demo data (same) ======
const baseRows = [
  { sym: "GOOGL", price: 36641.20, pct: -3.7,  delta: 10.2 },
  { sym: "V",     price: 36641.20, pct:  1.6,  delta: 10.2 },
  { sym: "MA",    price: 36641.20, pct:  1.6,  delta: 10.2 },
  { sym: "SCS",   price: 36641.20, pct: -3.7,  delta: 10.2 },
];
const data = Array.from({ length: 4 }, () => baseRows).flat();

// ====== Ticker -> Iconify multicolor logos ======
const ICONS = {
  GOOGL: { icon: "logos:google-icon" , bg:"#ffffff" },
  V:     { icon: "simple-icons:airbnb", bg: "#FF385C"},
  MA:    { icon: "logos:apple"       , bg:"#A1ACC2"},
  SCS:   { icon: "simple-icons:adobe",  bg:"#FA0F00"}, // example
};

// --- helpers ---
const $rows = document.getElementById("rows");
const fmt = (n) => Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// load Iconify if missing, then run cb
function ensureIconify(cb) {
  const ready = () => customElements.get('iconify-icon') || window.IconifyElement;
  if (ready()) return cb();
  const s = document.createElement("script");
  s.src = "https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js";
  s.onload = () => cb();
  s.onerror = () => cb(); // even if CDN blocked, we’ll fall back to letter
  document.head.appendChild(s);
}

// 💡 per-icon background color
function styleIconWrapper(el, bg) {
  el.className = "inline-flex items-center justify-center rounded-full h-[24px] w-[24px]";
  el.style.backgroundColor = bg || "#1f2435";
}
function injectLogo(container, sym) {
  const meta = ICONS[sym] || {};
  styleIconWrapper(container, meta.bg);
  if (!meta.icon) {
    container.textContent = sym?.[0] || "?";
    return;
  }
  container.innerHTML = `<iconify-icon icon="${meta.icon}" width="14" height="14"></iconify-icon>`;
}

// ✅ ensure table spacing even if HTML classes miss/blocked
function ensureTableSpacing(gapPx = 10) {
  const table = document.getElementById("grid");
  if (!table) return;
  // Tailwind classes (if available)
  table.classList.add("border-separate");
  try { table.classList.add(`[border-spacing:0_${gapPx}px]`); } catch {}
  // Hard inline fallback (always works)
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = `0 ${gapPx}px`;
}

// Helper: thead aur tbody ke beech spacer row
function insertHeaderBodyGap(px = 12) {
  const table = document.getElementById("grid");
  const colCount = table?.querySelector("thead tr")?.children.length || 4;

  const gapTr = document.createElement("tr");
  gapTr.setAttribute("aria-hidden", "true");

  const gapTd = document.createElement("td");
  gapTd.colSpan = colCount;
  gapTd.className = "p-0";
  gapTd.innerHTML = `<div style="height:${px}px"></div>`;

  $rows.appendChild(gapTr).appendChild(gapTd);
}

// ====== render (bg on TDs so gaps show) ======
function renderRows(list) {
  if (!$rows) return;
  $rows.innerHTML = "";

  // thead ↔ tbody gap (match your row gap if you like)
  insertHeaderBodyGap(12);

  list.forEach((r) => {
    const tr = document.createElement("tr");
    tr.className = "align-middle bg-[#ffff]!"; // TR par bg NAHIN

    // ticker
    const td1 = document.createElement("td");
    td1.className = "cell bg-[#161725] px-3 py-2";
    td1.innerHTML = `
      <div class="flex items-center whitespace-nowrap">
        <div class="flex items-center bg-[#0E0F18] border-[#1B1D30] border gap-2 py-2 rounded-[24px] pl-2 pr-4">
          <span class="icon"></span>
          <span class="chip">${r.sym}</span>
        </div>
      </div>
    `;
    injectLogo(td1.querySelector(".icon"), r.sym);

    // price
    const td2 = document.createElement("td");
    td2.className = "prizecell td bg-[#161725] px-3 py-2";
    td2.innerHTML = `$${fmt(r.price)}`;

    // % change
    const up = r.pct >= 0;
    const td3 = document.createElement("td");
    td3.className = "prizecell td bg-[#161725] text-right px-3 py-2";
    td3.innerHTML = `
      <span class="${up ? "text-[color:var(--pos,_#35E26C)]" : "text-[color:var(--neg,_#F23A4C)]"} inline-flex items-center gap-1">
        ${Math.abs(r.pct)}%
        ${
          up
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-[20px] w-[20px]" viewBox="0 0 24 24"><path fill="currentColor" d="M11 20V7.75L5.75 13L5 12.34l6.5-6.5l6.5 6.5l-.75.66L12 7.75V20z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" class="h-[20px] w-[20px]" viewBox="0 0 24 24"><path fill="currentColor" d="M12 5v12.25L17.25 12l.75.66l-6.5 6.5l-6.5-6.5l.75-.66L11 17.25V5z"/></svg>'
        }
      </span>
    `;

    // $ change
    const td4 = document.createElement("td");
    td4.className = "prizecell td bg-[#161725] text-right px-3 py-2";
    td4.innerHTML = `<span class="${up ? "text-[#35E26C]" : "text-[#F23A4C]"}">${fmt(r.delta)}</span>`;

    tr.append(td1, td2, td3, td4);
    $rows.appendChild(tr);
  });
}

// --- DOM ready + init (loads Iconify first, then renders) ---
(function start() {
  const run = () => ensureIconify(() => { ensureTableSpacing(2); renderRows(data); });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
