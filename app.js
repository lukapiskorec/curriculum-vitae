// Typewriter CV — Luka Piskorec
// Entry module. See PLAN.md for the task breakdown.

// ─── Palette ──────────────────────────────────────────────────────────────
const PALETTES = [
  { name: "manuscript", paper: "#f4ecd8", ink: "#1a1a1a" },
  { name: "sepia",      paper: "#f1e3c6", ink: "#4a2c0f" },
  { name: "manila",     paper: "#e9d8a6", ink: "#2d1b00" },
  { name: "cyanotype",  paper: "#e0e9f5", ink: "#0b3d6b" },
  { name: "mimeograph", paper: "#f2eee6", ink: "#3d2a72" },
  { name: "carbon",     paper: "#f7f3ea", ink: "#6b1a0a" },
  { name: "newsprint",  paper: "#e8e6e1", ink: "#111111" },
  { name: "legal pad",  paper: "#f4eda3", ink: "#1b3a5b" },
  { name: "oxford",     paper: "#ece6d7", ink: "#08234a" },
  { name: "botanical",  paper: "#ede7d3", ink: "#2b3a1f" },
];

const Palette = {
  i: 0,
  subs: [],
  pick(n = Math.floor(Math.random() * PALETTES.length)) {
    Palette.i = n;
    const p = PALETTES[n];
    document.documentElement.style.setProperty("--paper", p.paper);
    document.documentElement.style.setProperty("--ink", p.ink);
    const label = document.getElementById("palette-name");
    if (label) label.textContent = p.name;
    for (const fn of Palette.subs) fn(p);
  },
  next() { Palette.pick((Palette.i + 1) % PALETTES.length); },
};

// ─── Paper texture (background dust + fibers) ─────────────────────────────
// A single fixed-position SVG behind all content, generated once at boot
// and regenerated on (debounced) resize. Dots and fibers inherit the ink
// color via CSS `currentColor`, so palette changes recolor automatically.

const PAPER = {
  dustPer10kPx: 0.7,        // dust specks per 10000 px² of viewport
  fiberPer10kPx: 0.15,      // fibers   per 10000 px² of viewport
  dustRadiusRange: [0.4, 1.4],
  dustOpacityRange: [0.10, 0.28],
  fiberPointsRange: [3, 6], // points scattered per fiber (inclusive range)
  fiberScatterRange: [7, 14], // radius around fiber center to scatter points (px)
  fiberStrokeRange: [0.4, 0.7],
  fiberOpacityRange: [0.18, 0.34],
};

const Paper = {
  svg: null,
  coveredW: 0,
  coveredH: 0,

  _measureDoc() {
    return {
      w: document.documentElement.clientWidth,
      h: Math.max(document.documentElement.scrollHeight, window.innerHeight),
    };
  },

  // Build the markup for particles inside the rectangle [x0, y0, x1, y1).
  // Density scales with the rectangle's area so an extension strip gets
  // the same per-px² density as the initial coverage.
  _buildParts(x0, y0, x1, y1) {
    const w = x1 - x0;
    const h = y1 - y0;
    const area = (w * h) / 10000;
    const dustCount = Math.round(area * PAPER.dustPer10kPx);
    const fiberCount = Math.round(area * PAPER.fiberPer10kPx);
    const rand = (a, b) => a + Math.random() * (b - a);
    const parts = [];

    for (let i = 0; i < dustCount; i++) {
      const cx = (x0 + Math.random() * w).toFixed(1);
      const cy = (y0 + Math.random() * h).toFixed(1);
      const r = rand(PAPER.dustRadiusRange[0], PAPER.dustRadiusRange[1]).toFixed(2);
      const o = rand(PAPER.dustOpacityRange[0], PAPER.dustOpacityRange[1]).toFixed(2);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor" opacity="${o}"/>`);
    }
    for (let i = 0; i < fiberCount; i++) {
      const cx = x0 + Math.random() * w;
      const cy = y0 + Math.random() * h;
      const [minPts, maxPts] = PAPER.fiberPointsRange;
      const nPts = minPts + Math.floor(Math.random() * (maxPts - minPts + 1));
      const scatter = rand(PAPER.fiberScatterRange[0], PAPER.fiberScatterRange[1]);

      // Scatter nPts inside a disc around (cx, cy); visit in generation order.
      const pts = [];
      for (let j = 0; j < nPts; j++) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() * scatter;
        pts.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
      }

      // Catmull-Rom spline (tension = 0.5) through the points, expressed as
      // chained cubic Béziers. Endpoints are duplicated so the curve starts
      // and ends exactly on the first and last point.
      const pad = [pts[0], ...pts, pts[pts.length - 1]];
      let d = `M${pad[1].x.toFixed(1)},${pad[1].y.toFixed(1)}`;
      for (let j = 1; j < pad.length - 2; j++) {
        const p0 = pad[j - 1], p1 = pad[j], p2 = pad[j + 1], p3 = pad[j + 2];
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} `
          + `${c2x.toFixed(1)},${c2y.toFixed(1)} `
          + `${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }

      const sw = rand(PAPER.fiberStrokeRange[0], PAPER.fiberStrokeRange[1]).toFixed(2);
      const o = rand(PAPER.fiberOpacityRange[0], PAPER.fiberOpacityRange[1]).toFixed(2);
      parts.push(
        `<path d="${d}" stroke="currentColor" stroke-width="${sw}" `
        + `fill="none" opacity="${o}" stroke-linecap="round"/>`
      );
    }
    return parts.join("");
  },

  generate() {
    if (Paper.svg) Paper.svg.remove();
    const { w, h } = Paper._measureDoc();
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "paper-bg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.innerHTML = Paper._buildParts(0, 0, w, h);
    document.body.insertBefore(svg, document.body.firstChild);
    Paper.svg = svg;
    Paper.coveredW = w;
    Paper.coveredH = h;
  },

  // Extend the texture to cover a newly-grown document (e.g., a section
  // was opened). If the width changed we have to regenerate; otherwise
  // we append particles only for the new vertical strip so existing dust
  // and fibers keep their positions and the user sees a stable surface.
  extend() {
    if (!Paper.svg) { Paper.generate(); return; }
    const { w, h } = Paper._measureDoc();
    if (w !== Paper.coveredW) { Paper.generate(); return; }
    if (h <= Paper.coveredH) return;
    Paper.svg.insertAdjacentHTML(
      "beforeend",
      Paper._buildParts(0, Paper.coveredH, w, h)
    );
    Paper.svg.setAttribute("height", h);
    Paper.coveredH = h;
  },

  init() {
    Paper.generate();
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(Paper.generate, 200);
    });
    // Detect when document height grows (e.g., a section is opened by the
    // chip rail) and extend the texture into the new strip without
    // disturbing existing particles.
    let rafToken = 0;
    const ro = new ResizeObserver(() => {
      if (rafToken) cancelAnimationFrame(rafToken);
      rafToken = requestAnimationFrame(() => {
        rafToken = 0;
        Paper.extend();
      });
    });
    ro.observe(document.body);
  },
};

// ─── HTTP + helpers ───────────────────────────────────────────────────────
async function fetchText(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.text();
}
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
function hexToRgb(hex) {
  hex = hex.replace(/^\s*#?/, "").trim().toLowerCase();
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return [0, 0, 0];
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}
function readCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Detect devicePixelRatio changes (e.g. browser dragged to another monitor
// with a different scaling). `resize` doesn't fire reliably across monitors;
// a `(resolution: Xdppx)` media query does — when DPR changes the query
// stops matching, we get notified, then we re-arm for the new DPR.
function onDevicePixelRatioChange(callback) {
  function arm() {
    const dpr = window.devicePixelRatio || 1;
    const mql = matchMedia(`(resolution: ${dpr}dppx)`);
    mql.addEventListener("change", () => { callback(); arm(); }, { once: true });
  }
  arm();
}

// ─── Typing reveal ────────────────────────────────────────────────────────
// Walk text nodes inside `container`, wrap each char in a span set to
// visibility:hidden, then progressively flip them visible. Speed is uneven
// (variable batch size + occasional pauses + extra pause on punctuation) to
// give a more hand-typed feel.
//
// ┌── Tune the typing speed here ──────────────────────────────────────────┐
// │ All times are in milliseconds. Higher delays / lower minBatch = slower.│
// └────────────────────────────────────────────────────────────────────────┘
const TYPING = {
  minBatch: 2,          // min chars revealed per tick
  maxBatch: 6,          // max chars revealed per tick
  baseDelay: 10,        // base delay between ticks (ms)
  jitter: 5,            // random extra delay (0..jitter ms)
  pauseChance: 0.06,    // probability of a longer pause
  pauseDelay: 200,      // length of a longer pause (ms)
  punctPause: 60,       // extra ms after , ; : .  ! ?
};

const PUNCT = new Set([",", ";", ":", ".", "!", "?", "—", "–"]);

function typeReveal(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (n.textContent.trim()) textNodes.push(n);
  }

  // Wrap each original text node's chars in spans. Track each text node's
  // spans as its own group so coalesce restores them in their original
  // position — grouping by parent alone would collapse multiple text runs
  // that happen to share the same parent (e.g. "before <em>x</em> after"
  // inside one <p>) into a single block at the end of that parent.
  const charSpans = [];
  const groups = [];
  for (const tn of textNodes) {
    const text = tn.textContent;
    const frag = document.createDocumentFragment();
    const grp = [];
    for (let k = 0; k < text.length; k++) {
      const span = document.createElement("span");
      span.className = "tt-char";
      span.textContent = text[k];
      frag.appendChild(span);
      charSpans.push(span);
      grp.push(span);
    }
    tn.parentNode.replaceChild(frag, tn);
    groups.push(grp);
  }
  if (charSpans.length === 0) return;

  let i = 0;
  function tick() {
    if (Math.random() < TYPING.pauseChance) {
      setTimeout(tick, TYPING.pauseDelay);
      return;
    }
    const batch = TYPING.minBatch +
      Math.floor(Math.random() * (TYPING.maxBatch - TYPING.minBatch + 1));
    const target = Math.min(i + batch, charSpans.length);
    let punctHit = false;
    for (; i < target; i++) {
      charSpans[i].classList.add("tt-on");
      if (PUNCT.has(charSpans[i].textContent)) punctHit = true;
    }
    if (i < charSpans.length) {
      const delay = TYPING.baseDelay
        + Math.floor(Math.random() * TYPING.jitter)
        + (punctHit ? TYPING.punctPause : 0);
      setTimeout(tick, delay);
    } else {
      // Coalesce: each original text node's spans become one text node again,
      // re-inserted at its original position.
      for (const group of groups) {
        if (group.length === 0) continue;
        const parent = group[0].parentNode;
        if (!parent) continue;
        const text = group.map(s => s.textContent).join("");
        const after = group[group.length - 1].nextSibling;
        for (const s of group) s.remove();
        parent.insertBefore(document.createTextNode(text), after);
      }
    }
  }
  setTimeout(tick, 0);
}

// ─── Frontmatter ──────────────────────────────────────────────────────────
function splitFrontmatter(src) {
  if (!src.startsWith("---")) return { meta: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: src };
  return {
    meta: parseFrontmatter(src.slice(3, end).trim()),
    body: src.slice(end + 4).replace(/^\s*\n/, ""),
  };
}
function parseFrontmatter(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
  const root = {};
  const stack = [{ container: root, indent: -1 }];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].container;
    if (line.startsWith("- ")) {
      const rest = line.slice(2).trim();
      if (!Array.isArray(parent)) continue;
      if (rest.startsWith("{")) parent.push(parseFlowObject(rest));
      else parent.push(parseScalar(rest));
      continue;
    }
    if (!line.includes(":")) continue;
    const [k, v] = splitKV(line);
    if (v === "") {
      const nxt = lines[i + 1];
      const isArray = nxt && nxt.trim().startsWith("- ");
      parent[k] = isArray ? [] : {};
      stack.push({ container: parent[k], indent });
    } else {
      parent[k] = parseScalar(v);
    }
  }
  return root;
}
function splitKV(line) {
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === ":") return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  }
  return [line, ""];
}
function parseScalar(s) {
  if (!s) return "";
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null" || s === "~") return null;
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}
function parseFlowObject(s) {
  s = s.trim().replace(/^\{/, "").replace(/\}$/, "");
  const obj = {};
  for (const part of splitFlowFields(s)) {
    const [k, v] = splitKV(part);
    if (k) obj[k] = parseScalar(v);
  }
  return obj;
}
function splitFlowFields(s) {
  const parts = []; let cur = "", q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === "," && !q) { parts.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ─── Doc registry (filled by preloadDocList) ──────────────────────────────
// Set of chip-able doc filenames (e.g. "education.md"). Used by the MD parser
// to detect doc-to-doc references and render them as chip mirrors.
const DOCS = new Set();
let DOC_ORDER = [];

async function preloadDocList() {
  const src = await fetchText("compiled/index.md");
  const seen = new Set();
  const ordered = [];
  const excluded = new Set(["profile.md", "index.md", "bios.md"]);
  for (const m of src.matchAll(/\[`([a-z][a-z0-9-]*\.md)`\]/g)) {
    const n = m[1];
    if (excluded.has(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    ordered.push(n);
  }
  DOC_ORDER = ordered;
  for (const d of ordered) DOCS.add(d);
}

// ─── Markdown (light parse) ───────────────────────────────────────────────
const MD = {
  render(src) {
    const lines = src.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i].trim()) { i++; continue; }

      if (lines[i].startsWith("```")) {
        const code = []; i++;
        while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
        i++;
        out.push(`<pre class="md-code">${escHtml(code.join("\n"))}</pre>`);
        continue;
      }

      const h = lines[i].match(/^(#{1,3})\s+(.+)$/);
      if (h) {
        out.push(`<h${h[1].length}>${inlineMd(h[2])}</h${h[1].length}>`);
        i++;
        continue;
      }

      if (/^-{3,}\s*$/.test(lines[i])) { out.push(`<hr>`); i++; continue; }

      if (lines[i].includes("|") && i + 1 < lines.length &&
          /^\s*\|?[\s\-:|]+\|/.test(lines[i + 1])) {
        const tbl = [];
        while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
          tbl.push(lines[i]); i++;
        }
        out.push(`<pre class="md-table">${escHtml(tbl.join("\n"))}</pre>`);
        continue;
      }

      if (/^[-*]\s+/.test(lines[i])) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          let item = lines[i].replace(/^[-*]\s+/, ""); i++;
          while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
            item += " " + lines[i].trim(); i++;
          }
          items.push(item);
        }
        out.push(`<ul>${items.map(it => `<li>${inlineMd(it)}</li>`).join("")}</ul>`);
        continue;
      }

      if (/^\d+\.\s+/.test(lines[i])) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s+/, "")); i++;
        }
        out.push(`<ol>${items.map(it => `<li>${inlineMd(it)}</li>`).join("")}</ol>`);
        continue;
      }

      const para = [];
      while (i < lines.length && lines[i].trim()
             && !/^#{1,3}\s/.test(lines[i])
             && !/^[-*]\s+/.test(lines[i])
             && !/^\d+\.\s+/.test(lines[i])
             && !lines[i].startsWith("```")
             && !/^-{3,}\s*$/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      if (para.length) out.push(`<p>${inlineMd(para.join(" "))}</p>`);
    }
    return out.join("\n");
  },
};

function inlineMd(s) {
  // Stash autolinks <https://…> before HTML-escape so the angle brackets survive.
  const autos = [];
  s = s.replace(/<(https?:\/\/[^\s>]+)>/g, (_, u) => {
    autos.push(u);
    return `\x00A${autos.length - 1}\x00`;
  });

  s = escHtml(s);

  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\x00C${codes.length - 1}\x00`;
  });

  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
    const url = u.split("#")[0];
    if (DOCS.has(url)) {
      return `<button class="chip docref" type="button" data-doc="${url}" aria-pressed="false">[ ] ${url.replace(".md", "")}</button>`;
    }
    if (/\.md$/.test(url)) {
      return `<span class="docref-static">${escHtml(t)}</span>`;
    }
    return `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;
  });

  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");

  s = s.replace(/\x00C(\d+)\x00/g, (_, n) => `<code>${codes[Number(n)]}</code>`);
  s = s.replace(/\x00A(\d+)\x00/g, (_, n) => {
    const u = autos[Number(n)];
    return `<a href="${u}" target="_blank" rel="noopener">${escHtml(u)}</a>`;
  });
  return s;
}

// ─── Banner (marquee + shimmer) ───────────────────────────────────────────
// One-line "CURRICULUM VITAE" scrolling left in discrete one-character steps
// every 250ms (4 fps), giving the typewriter "clack" feel. A continuous RAF
// loop applies a probabilistic shimmer near the cursor: closer chars have a
// higher chance of swapping, swapped chars persist for a randomised lifespan,
// and the effect decays over ~2s after the pointer leaves rather than
// snapping off.

const BANNER_RAW = String.raw`________/\\\\\\\\\______________________________________________________________________________/\\\\\\_________________________________________________/\\\________/\\\_______________________________________________________________________
______/\\\////////______________________________________________________________________________\////\\\________________________________________________\/\\\_______\/\\\______________________________________________________________________
_____/\\\/______________________________________________________/\\\________________________________\/\\\________________________________________________\//\\\______/\\\___/\\\_____/\\\______________________________________________________
_____/\\\______________/\\\____/\\\__/\\/\\\\\\\___/\\/\\\\\\\__\///______/\\\\\\\\__/\\\____/\\\____\/\\\_____/\\\____/\\\____/\\\\\__/\\\\\______________\//\\\____/\\\___\///___/\\\\\\\\\\\__/\\\\\\\\\________/\\\\\\\\___________________
_____\/\\\_____________\/\\\___\/\\\_\/\\\/////\\\_\/\\\/////\\\__/\\\___/\\\//////__\/\\\___\/\\\____\/\\\____\/\\\___\/\\\__/\\\///\\\\\///\\\_____________\//\\\__/\\\_____/\\\_\////\\\////__\////////\\\_____/\\\/////\\\_________________
______\//\\\____________\/\\\___\/\\\_\/\\\___\///__\/\\\___\///__\/\\\__/\\\_________\/\\\___\/\\\____\/\\\____\/\\\___\/\\\_\/\\\_\//\\\__\/\\\______________\//\\\/\\\_____\/\\\____\/\\\________/\\\\\\\\\\___/\\\\\\\\\\\_________________
________\///\\\__________\/\\\___\/\\\_\/\\\_________\/\\\_________\/\\\_\//\\\________\/\\\___\/\\\____\/\\\____\/\\\___\/\\\_\/\\\__\/\\\__\/\\\_______________\//\\\\\______\/\\\____\/\\\_/\\___/\\\/////\\\__\//\\///////_________________
___________\////\\\\\\\\\_\//\\\\\\\\\__\/\\\_________\/\\\_________\/\\\__\///\\\\\\\\_\//\\\\\\\\\___/\\\\\\\\\_\//\\\\\\\\\__\/\\\__\/\\\__\/\\\________________\//\\\_______\/\\\____\//\\\\\___\//\\\\\\\\/\\__\//\\\\\\\\\\______________
_______________\/////////___\/////////___\///__________\///__________\///_____\////////___\/////////___\/////////___\/////////___\///___\///___\///__________________\///________\///______\/////_____\////////\//____\//////////______________`;

const BANNER_ROWS = (() => {
  const lines = BANNER_RAW.split("\n");
  const w = Math.max(...lines.map(l => l.length));
  return lines.map(l => l.padEnd(w, "_"));
})();

// ┌── Shimmer tuning (Banner) ─────────────────────────────────────────────┐
// │ Tweak these to dial how lively / persistent / spreading the effect is. │
// └────────────────────────────────────────────────────────────────────────┘
const SHIMMER = {
  pool: "/\\_-|.,:;'`",   // chars to swap in (visually compatible with banner)
  radius: 70,             // px radius of influence around cursor
  newCharProb: 0.18,      // max per-frame chance for a calm char to flip (at d=0)
  rerollProb: 0.06,       // per-frame chance for a shimmer char to swap to a new pool char
  rerollGate: 80,         // ms gate between rerolls per char
  minLifeMs: 220,         // before this age, a char will not revert
  maxLifeMs: 1400,        // by this age, char is force-reverted
  revertBaseProb: 0.03,   // base per-frame revert chance after minLife
  revertFarBonus: 0.18,   // extra revert prob when cursor is far
  decayMs: 2000,          // how long shimmer keeps living after pointerleave
  stepDelayMs: 1000,       // marquee step interval (4 fps)
};

const Banner = {
  track: null,
  spans: [],
  origChars: [],
  spanPos: null,                 // [{x, y}] static offsets relative to track origin
  shimmerState: new Map(),       // span index -> { startedAt, lastChange }
  lastX: -1e9,
  lastY: -1e9,
  pointerInside: false,
  pointerLeftAt: 0,
  loopRunning: false,

  init(target) {
    const copy = BANNER_ROWS
      .map(r => r.split("").map(c => `<span>${escHtml(c)}</span>`).join(""))
      .join("\n");
    target.innerHTML = `
      <div class="marquee">
        <div class="marquee-track">
          <pre class="banner-art">${copy}</pre>
          <pre class="banner-art" aria-hidden="true">${copy}</pre>
        </div>
      </div>`;
    const marquee = target.querySelector(".marquee");
    Banner.track = target.querySelector(".marquee-track");
    Banner.spans = [...marquee.querySelectorAll(".banner-art span")];
    Banner.origChars = Banner.spans.map(s => s.textContent);

    // Step-wise marquee animation: each step = one banner-column width.
    // Steps count = banner column count (one copy). Total cycle scrolls
    // one copy width = -50% of the two-copy track.
    const cols = BANNER_ROWS[0].length;
    Banner.track.style.animation =
      `marquee-scroll ${cols * SHIMMER.stepDelayMs}ms steps(${cols}) infinite`;

    const cachePos = () => requestAnimationFrame(Banner.cachePositions);
    const ready = (document.fonts && document.fonts.ready) || Promise.resolve();
    ready.then(cachePos);
    window.addEventListener("resize", cachePos);

    marquee.addEventListener("pointerenter", Banner.onEnter);
    marquee.addEventListener("pointermove", Banner.onMove);
    marquee.addEventListener("pointerleave", Banner.onLeave);
    // On touch/pen, the browser implicitly captures the pointer, so
    // `pointerleave` often doesn't fire when the finger lifts. Treat
    // pointerup/pointercancel as a leave for non-mouse pointers so the
    // shimmer can decay normally. Mouse clicks are ignored on purpose —
    // we don't want a click to terminate the hover.
    const touchEnd = (e) => { if (e.pointerType !== "mouse") Banner.onLeave(); };
    marquee.addEventListener("pointerup", touchEnd);
    marquee.addEventListener("pointercancel", touchEnd);
  },

  cachePositions() {
    if (!Banner.track) return;
    const t = Banner.track.getBoundingClientRect();
    Banner.spanPos = Banner.spans.map(s => {
      const r = s.getBoundingClientRect();
      return {
        x: r.left - t.left + r.width / 2,
        y: r.top - t.top + r.height / 2,
      };
    });
  },

  onEnter(e) {
    Banner.pointerInside = true;
    Banner.pointerLeftAt = 0;
    Banner.lastX = e.clientX;
    Banner.lastY = e.clientY;
    Banner.startLoop();
  },
  onMove(e) {
    Banner.lastX = e.clientX;
    Banner.lastY = e.clientY;
    Banner.startLoop();
  },
  onLeave() {
    Banner.pointerInside = false;
    Banner.pointerLeftAt = performance.now();
  },

  startLoop() {
    if (Banner.loopRunning) return;
    Banner.loopRunning = true;
    requestAnimationFrame(Banner.tick);
  },

  // Mouse-intensity factor (1.0 while pointer inside, decays to 0 after leave).
  mouseFactor(now) {
    if (Banner.pointerInside) return 1;
    if (!Banner.pointerLeftAt) return 0;
    return Math.max(0, 1 - (now - Banner.pointerLeftAt) / SHIMMER.decayMs);
  },

  tick(now) {
    if (!Banner.spanPos) {
      // Positions not yet cached (fonts still loading). Reschedule.
      requestAnimationFrame(Banner.tick);
      return;
    }
    const t = Banner.track.getBoundingClientRect();
    const tx = t.left, ty = t.top;
    const mx = Banner.lastX, my = Banner.lastY;
    const R = SHIMMER.radius;
    const R2 = R * R;
    const mouseF = Banner.mouseFactor(now);

    const pool = SHIMMER.pool;
    const poolLen = pool.length;

    for (let i = 0; i < Banner.spans.length; i++) {
      const orig = Banner.origChars[i];
      if (orig === " ") continue;

      // Per-char distance-based intensity (uses cached offsets + live track box).
      const p = Banner.spanPos[i];
      const dx = tx + p.x - mx;
      const dy = ty + p.y - my;
      let intensity;
      if (dx > R || dx < -R || dy > R || dy < -R) {
        intensity = 0;
      } else {
        const d2 = dx * dx + dy * dy;
        intensity = d2 >= R2 ? 0 : (1 - Math.sqrt(d2) / R);
      }
      // Quadratic falloff feels more focused than linear.
      intensity = intensity * intensity * mouseF;

      const state = Banner.shimmerState.get(i);
      const span = Banner.spans[i];

      if (state) {
        const age = now - state.startedAt;

        // Occasionally swap the shimmer char to a different pool char.
        if (now - state.lastChange > SHIMMER.rerollGate
            && Math.random() < SHIMMER.rerollProb + intensity * 0.25) {
          span.textContent = pool[(Math.random() * poolLen) | 0];
          state.lastChange = now;
        }

        // Revert: forced after max life, or stochastic after min life.
        if (age >= SHIMMER.maxLifeMs) {
          span.textContent = orig;
          Banner.shimmerState.delete(i);
        } else if (age >= SHIMMER.minLifeMs) {
          const pRevert = SHIMMER.revertBaseProb
            + (1 - intensity) * SHIMMER.revertFarBonus;
          if (Math.random() < pRevert) {
            span.textContent = orig;
            Banner.shimmerState.delete(i);
          }
        }
      } else if (intensity > 0) {
        if (Math.random() < SHIMMER.newCharProb * intensity) {
          span.textContent = pool[(Math.random() * poolLen) | 0];
          Banner.shimmerState.set(i, { startedAt: now, lastChange: now });
        }
      }
    }

    // Keep looping while pointer is engaged OR there are still shimmer chars
    // to revert. When both stop we can suspend the RAF.
    const stillDecaying = !Banner.pointerInside &&
      Banner.pointerLeftAt &&
      (now - Banner.pointerLeftAt) < SHIMMER.decayMs + SHIMMER.maxLifeMs;
    if (Banner.pointerInside || Banner.shimmerState.size > 0 || stillDecaying) {
      requestAnimationFrame(Banner.tick);
    } else {
      Banner.loopRunning = false;
    }
  },
};

// ─── Portrait (canvas, palette-reactive, DPR-variant aware) ───────────────
// Preferred path: pick the dithered variant whose native width matches the
// current device pixel ratio. Each variant is sized so that
//   native_px / dpr ≈ PORTRAIT_TARGET_CSS_W
// which keeps the on-page size visually identical across DPRs while keeping
// every dither pixel pinned to a device pixel (no resampling, no smear).
//
// If no variant is available (e.g. file not produced yet), we fall back to
// the original quarter image at a fixed CSS size. On fractional DPRs the
// fallback will show mild dither artefacts — produce a matching variant to
// remove them.

const PORTRAIT_VARIANTS = [
  { dpr: 1.0,  src: "assets/profile/dithered/luka_head_200w.png" },
  { dpr: 1.25, src: "assets/profile/dithered/luka_head_250w.png" },
  { dpr: 1.5,  src: "assets/profile/dithered/luka_head_300w.png" },
  { dpr: 2.0,  src: "assets/profile/dithered/luka_head_400w.png" },
];
const PORTRAIT_FALLBACK_SRC =
  "assets/profile/dithered/luka_head_tencent_hunyuan_V31_view_02_quarter.png";
const PORTRAIT_TARGET_CSS_W = 200;

async function tryLoadImage(src) {
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    await img.decode();
    return img;
  } catch {
    return null;
  }
}

const Portrait = {
  imageData: null,
  _ditherToken: null,
  cssWidth: PORTRAIT_TARGET_CSS_W,
  cssHeight: PORTRAIT_TARGET_CSS_W * 1000 / 752,

  async load() {
    const dpr = window.devicePixelRatio || 1;
    // Try the closest-DPR variant first; only one network attempt before fallback.
    const closest = [...PORTRAIT_VARIANTS]
      .sort((a, b) => Math.abs(a.dpr - dpr) - Math.abs(b.dpr - dpr))[0];

    let img = closest ? await tryLoadImage(closest.src) : null;
    if (img) {
      // Pin device-pixels = native size, derive CSS size from DPR.
      Portrait.cssWidth = img.naturalWidth / dpr;
      Portrait.cssHeight = img.naturalHeight / dpr;
    } else {
      img = await tryLoadImage(PORTRAIT_FALLBACK_SRC);
      if (!img) return;
      // Fixed CSS size — visually consistent across DPRs, but dither may
      // smear slightly on fractional DPRs until a matching variant exists.
      Portrait.cssWidth = PORTRAIT_TARGET_CSS_W;
      Portrait.cssHeight =
        PORTRAIT_TARGET_CSS_W * img.naturalHeight / img.naturalWidth;
    }

    const raw = document.createElement("canvas");
    raw.width = img.naturalWidth;
    raw.height = img.naturalHeight;
    raw.getContext("2d").drawImage(img, 0, 0);
    Portrait.imageData = raw.getContext("2d")
      .getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  },

  paintTo(canvas) {
    if (!Portrait.imageData) return;
    const paper = hexToRgb(readCssVar("--paper"));
    const ink = hexToRgb(readCssVar("--ink"));
    const w = Portrait.imageData.width;
    const h = Portrait.imageData.height;
    const src = Portrait.imageData.data;
    const out = new Uint8ClampedArray(src.length);
    for (let i = 0; i < src.length; i += 4) {
      const isInk = src[i] < 128;
      const c = isInk ? ink : paper;
      out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; out[i + 3] = 255;
    }
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    tmp.getContext("2d").putImageData(new ImageData(out, w, h), 0, 0);

    const dpr = window.devicePixelRatio || 1;
    const devW = Math.round(Portrait.cssWidth * dpr);
    const devH = Math.round(Portrait.cssHeight * dpr);

    canvas.width = devW;
    canvas.height = devH;
    canvas.style.width = Portrait.cssWidth + "px";
    canvas.style.height = Portrait.cssHeight + "px";

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, devW, devH);
    ctx.drawImage(tmp, 0, 0, devW, devH);
  },

  // Kick off the Dither precompute and animation. Fire-and-forget.
  // Cancels any in-progress precompute first so DPR-change rebuilds are safe.
  async startAnimation(canvas) {
    Dither.stop();
    Dither._pausedAt = 0;
    if (Portrait._ditherToken) Portrait._ditherToken.aborted = true;
    const token = { aborted: false };
    Portrait._ditherToken = token;
    try {
      const ok = await Dither.precompute({
        dpr: window.devicePixelRatio || 1,
        signal: token,
      });
      if (!ok || token.aborted) return;
      Dither.runLoop(canvas);
    } catch (e) {
      console.warn("[Portrait] dither animation failed:", e);
      // Static portrait stays as the visible fallback.
    }
  },
};

// ─── Dither (animated traveling Floyd-Steinberg) ──────────────────────────
// Pre-computes N 1-bit frame masks during boot (after first static paint),
// then runs a RAF loop that recolors the current mask with the active palette.
// See docs/superpowers/specs/2026-05-12-traveling-dither-design.md.

// ┌── Mode + Presets ───────────────────────────────────────────────────────┐
// │ Two dither algorithms — pick via `mode`. Reload page to apply.          │
// │                                                                          │
// │ "fs"    Floyd-Steinberg error diffusion. Per-frame noise realizations   │
// │         travel across a 2× wide canvas, cropped back to image bounds.   │
// │         Reads as alive-but-incoherent grain. Heavy precompute.          │
// │                                                                          │
// │         FS presets (active when mode = "fs"):                           │
// │           default        fsTravelMs 5000   fsStepPx 4   N=50            │
// │           smooth         fsTravelMs 8000   fsStepPx 2   N=100           │
// │           slow + smooth  fsTravelMs 15000  fsStepPx 1   N=200, ~11MB    │
// │           meditative     fsTravelMs 40000  fsStepPx 1   N=200, ~11MB    │
// │                                                                          │
// │ "bayer" Ordered (Bayer) threshold dither with a sliding matrix. Produces│
// │         visible diagonal bands marching smoothly upward across the      │
// │         image. Cheap precompute (only matrixSize frames).               │
// │                                                                          │
// │         Bayer presets (active when mode = "bayer"):                     │
// │           subtle drift   bayerMatrixSize 4   bayerCycleMs 1500          │
// │           classic bands  bayerMatrixSize 8   bayerCycleMs 1000  ← active│
// │           brisk          bayerMatrixSize 8   bayerCycleMs 500           │
// │           slow march     bayerMatrixSize 8   bayerCycleMs 2400          │
// │                                                                          │
// │         bayerCycleMs = duration of one matrix cycle (= matrixSize px of │
// │         motion). Band velocity in px/sec = 1000 * matrixSize / cycleMs. │
// └──────────────────────────────────────────────────────────────────────────┘
const DITHER = {
  mode: "bayer",             // "fs" or "bayer"

  // FS mode tuning
  fsTravelMs: 8000,
  fsStepPx: 2,

  // Bayer mode tuning
  bayerMatrixSize: 8,        // 4 or 8
  bayerCycleMs: 1000,

  internalWByDpr: { 1.0: 200, 1.25: 250, 1.5: 300, 2.0: 400 },
  originalSrc: "assets/profile/original/luka_head_tencent_hunyuan_V31_view_02_original.png",
};

const Dither = {
  // State (populated by precompute / runLoop)
  frames: null,
  W: 0, H: 0, N: 0,
  dprAtBuild: 0,
  bgRGB: null,
  rafId: 0,
  lastK: -1,
  startTime: 0,
  abortToken: null,
  scratchCanvas: null,
  scratchCtx: null,

  _pickInternalW(dpr) {
    const keys = Object.keys(DITHER.internalWByDpr).map(Number);
    let best = keys[0];
    for (const k of keys) {
      if (Math.abs(k - dpr) < Math.abs(best - dpr)) best = k;
    }
    return DITHER.internalWByDpr[best];
  },

  _loadOriginal() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Dither: failed to load ${DITHER.originalSrc}`));
      img.src = DITHER.originalSrc;
    });
  },

  _downscale(img, W) {
    const H = Math.round(W * img.naturalHeight / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, W, H);
    return { canvas: c, ctx, W, H };
  },

  _sampleBg(smallCtx) {
    const d = smallCtx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  },

  // Floyd-Steinberg, standard kernel (7/16, 3/16, 5/16, 1/16).
  // Input:  ImageData (RGBA, any size)
  // Output: Uint8Array of length width*height; 0 = ink (dark), 1 = paper (light)
  _floydSteinberg(imageData) {
    const w = imageData.width;
    const h = imageData.height;
    const src = imageData.data;
    // Working buffer in floats so error diffusion doesn't clamp early.
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < src.length; i += 4, p++) {
      // Rec. 601 luminance.
      lum[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    }
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const old = lum[i];
        const neu = old < 128 ? 0 : 255;
        out[i] = neu === 0 ? 0 : 1;
        const err = old - neu;
        if (x + 1 < w)               lum[i + 1]         += err * 7 / 16;
        if (y + 1 < h) {
          if (x > 0)                 lum[i + w - 1]     += err * 3 / 16;
                                     lum[i + w]         += err * 5 / 16;
          if (x + 1 < w)             lum[i + w + 1]     += err * 1 / 16;
        }
      }
    }
    return out;
  },

  // FS: generate one frame mask via Floyd-Steinberg of a wide canvas.
  // Builds a 2W × H wide canvas filled with bg, places the downscaled image
  // at xOffset = W - k*stepPx, dithers the full wide canvas, returns the
  // W × H crop starting at that xOffset.
  _generateFrameFS(smallCanvas, bgRGB, W, H, k, stepPx) {
    const wideW = 2 * W;
    const wide = document.createElement("canvas");
    wide.width = wideW; wide.height = H;
    const wctx = wide.getContext("2d");

    wctx.fillStyle = `rgb(${bgRGB[0]},${bgRGB[1]},${bgRGB[2]})`;
    wctx.fillRect(0, 0, wideW, H);

    const xOffset = W - k * stepPx;
    wctx.imageSmoothingEnabled = false;
    wctx.drawImage(smallCanvas, xOffset, 0);

    const wideData = wctx.getImageData(0, 0, wideW, H);
    const wideMask = this._floydSteinberg(wideData);

    // Crop W × H window starting at column xOffset.
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      const srcRow = y * wideW + xOffset;
      const dstRow = y * W;
      for (let x = 0; x < W; x++) {
        out[dstRow + x] = wideMask[srcRow + x];
      }
    }
    return out;
  },

  // Bayer ordered-dither threshold matrices. Values in [0, M*M-1].
  _bayerMatrices: {
    4: [
       0,  8,  2, 10,
      12,  4, 14,  6,
       3, 11,  1,  9,
      15,  7, 13,  5,
    ],
    8: [
       0, 32,  8, 40,  2, 34, 10, 42,
      48, 16, 56, 24, 50, 18, 58, 26,
      12, 44,  4, 36, 14, 46,  6, 38,
      60, 28, 52, 20, 62, 30, 54, 22,
       3, 35, 11, 43,  1, 33,  9, 41,
      51, 19, 59, 27, 49, 17, 57, 25,
      15, 47,  7, 39, 13, 45,  5, 37,
      63, 31, 55, 23, 61, 29, 53, 21,
    ],
  },

  // Bayer: generate one frame mask by thresholding the static image against
  // an MxM Bayer matrix indexed at (y + k) mod M. Incrementing k shifts the
  // threshold pattern upward across the (fixed) image — bands travel bottom→top.
  // The image content does not move; only the threshold pattern does.
  _generateFrameBayer(smallCtx, W, H, k, matrixSize) {
    const data = smallCtx.getImageData(0, 0, W, H).data;
    const M = matrixSize;
    const mask = M - 1;
    const mat = this._bayerMatrices[M];
    const scale = 255 / (M * M);
    const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) {
      const yrow = ((y + k) & mask) * M;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const threshold = (mat[yrow + (x & mask)] + 0.5) * scale;
        out[i] = lum > threshold ? 1 : 0;
      }
    }
    return out;
  },

  async precompute({ dpr, signal } = {}) {
    dpr = dpr || (window.devicePixelRatio || 1);
    const W = this._pickInternalW(dpr);

    const img = await this._loadOriginal();
    if (signal?.aborted) return false;

    const small = this._downscale(img, W);
    const H = small.H;

    let frames, N;
    if (DITHER.mode === "bayer") {
      const M = DITHER.bayerMatrixSize;
      N = M;
      frames = new Array(N);
      for (let k = 0; k < N; k++) {
        if (signal?.aborted) return false;
        frames[k] = this._generateFrameBayer(small.ctx, W, H, k, M);
        await new Promise(r => setTimeout(r, 0));
      }
      this.bgRGB = null;
    } else {
      const stepPx = DITHER.fsStepPx;
      const bg = this._sampleBg(small.ctx);
      N = Math.floor(W / stepPx);
      frames = new Array(N);
      for (let k = 0; k < N; k++) {
        if (signal?.aborted) return false;
        frames[k] = this._generateFrameFS(small.canvas, bg, W, H, k, stepPx);
        await new Promise(r => setTimeout(r, 0));
      }
      this.bgRGB = bg;
    }
    if (signal?.aborted) return false;

    this.frames = frames;
    this.W = W; this.H = H; this.N = N;
    this.dprAtBuild = dpr;

    // Reusable scratch canvas for paintFrame.
    this.scratchCanvas = document.createElement("canvas");
    this.scratchCanvas.width = W;
    this.scratchCanvas.height = H;
    this.scratchCtx = this.scratchCanvas.getContext("2d");

    return true;
  },
  paintFrame(canvas, k, palette) {
    if (!this.frames) return;
    if (k < 0 || k >= this.N) return;

    const mask = this.frames[k];
    const W = this.W, H = this.H;
    const ink = palette.ink, paper = palette.paper;

    const out = this.scratchCtx.createImageData(W, H);
    const od = out.data;
    for (let i = 0, p = 0; p < mask.length; i += 4, p++) {
      const c = mask[p] === 0 ? ink : paper;
      od[i] = c[0]; od[i + 1] = c[1]; od[i + 2] = c[2]; od[i + 3] = 255;
    }
    this.scratchCtx.putImageData(out, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    // CSS size: match the existing Portrait sizing logic so the canvas
    // visually matches the static variant the page just painted.
    const cssW = Portrait.cssWidth;
    const cssH = Portrait.cssHeight;
    const devW = Math.round(cssW * dpr);
    const devH = Math.round(cssH * dpr);

    if (canvas.width !== devW)  canvas.width = devW;
    if (canvas.height !== devH) canvas.height = devH;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, devW, devH);
    ctx.drawImage(this.scratchCanvas, 0, 0, devW, devH);

    this.lastK = k;
  },
  _currentPalette() {
    return {
      ink: hexToRgb(readCssVar("--ink")),
      paper: hexToRgb(readCssVar("--paper")),
    };
  },

  runLoop(canvas) {
    this.stop();
    this.startTime = performance.now();
    this.lastK = -1;
    const travelMs = DITHER.mode === "bayer" ? DITHER.bayerCycleMs : DITHER.fsTravelMs;
    const tick = (now) => {
      const elapsed = now - this.startTime;
      const k = Math.floor((elapsed / travelMs) * this.N) % this.N;
      if (k !== this.lastK) {
        this.paintFrame(canvas, k, this._currentPalette());
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);

    // Pause when tab is hidden; resume preserving offset. Re-register on
    // each runLoop call so the handler captures the current `tick` closure.
    if (this._visHandler) {
      document.removeEventListener("visibilitychange", this._visHandler);
    }
    this._visHandler = () => {
      if (document.hidden) {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this._pausedAt = performance.now();
      } else if (this._pausedAt) {
        this.startTime += performance.now() - this._pausedAt;
        this._pausedAt = 0;
        this.rafId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", this._visHandler);
  },

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  },

  _modes: ["bayer", "fs"],
  _modeDisplayName(m) { return m === "fs" ? "floyd-steinberg" : "bayer"; },
  _updateModeLabel() {
    const el = document.getElementById("graphics-name");
    if (el) el.textContent = Dither._modeDisplayName(DITHER.mode);
  },
  nextMode() {
    const idx = Dither._modes.indexOf(DITHER.mode);
    DITHER.mode = Dither._modes[(idx + 1) % Dither._modes.length];
    Dither._updateModeLabel();
    const canvas = document.getElementById("portrait");
    if (canvas) Portrait.startAnimation(canvas);
  },
};

// ─── Bios extractor ───────────────────────────────────────────────────────
const Bios = {
  cache: null,
  async load() {
    if (Bios.cache) return Bios.cache;
    const src = await fetchText("compiled/bios.md");
    const { body } = splitFrontmatter(src);
    const segments = body.split(/\n---\n/);
    const out = { identity: "", bio150: "", bio250: "", bio500: "" };
    for (const seg of segments) {
      const m = seg.match(/^\s*##\s+(.+?)\n([\s\S]*)$/);
      if (!m) continue;
      const heading = m[1].trim();
      const text = m[2].trim();
      if (/Identity/i.test(heading)) out.identity = text;
      else if (/150/.test(heading)) out.bio150 = text;
      else if (/250/.test(heading)) out.bio250 = text;
      else if (/500/.test(heading)) out.bio500 = text;
    }
    Bios.cache = out;
    return out;
  },
};

// ─── Identity (name + 30-word statement) ──────────────────────────────────
async function renderIdentity(profileMeta) {
  const bios = await Bios.load();
  const name = profileMeta.name?.canonical ?? "Luka Piškorec";
  document.getElementById("identity").innerHTML = `
    <div class="name">${escHtml(name)}</div>
    <p class="identity-statement">${escHtml(bios.identity)}</p>
  `;
}

// ─── Bio (portrait + variable bio length) ─────────────────────────────────
const BioCtl = {
  lengths: ["150", "250", "500"],
  i: 0,
  bios: null,

  async render() {
    BioCtl.bios = await Bios.load();
    document.getElementById("bio").innerHTML = `
      <div class="bio-row">
        <div class="portrait-wrap">
          <canvas class="portrait" id="portrait" aria-label="Portrait of Luka Piškorec"></canvas>
          <div class="portrait-controls">
            <button id="reroll" type="button">[palette]</button>
            <span id="palette-name" class="palette-name"></span>
            <button id="graphics" type="button">[graphics]</button>
            <span id="graphics-name" class="palette-name"></span>
          </div>
        </div>
        <div class="bio-text">
          <div id="bio-body"></div>
          <div class="bio-controls">
            <button id="bio-shorter" type="button">[shorter]</button>
            <button id="bio-longer" type="button">[longer]</button>
            <span class="bio-length" id="bio-length"></span>
          </div>
        </div>
      </div>`;
    await Portrait.load();
    const canvas = document.getElementById("portrait");
    Portrait.paintTo(canvas);
    Portrait.startAnimation(canvas);
    Palette.subs.push(() => {
      // If the dither animation is running, the next RAF tick will pick up
      // the new palette automatically. Force an immediate repaint of the
      // current frame so palette changes feel instant rather than waiting
      // up to ~100ms for the next frame boundary.
      if (Dither.frames && Dither.rafId) {
        Dither.paintFrame(canvas, Dither.lastK >= 0 ? Dither.lastK : 0, Dither._currentPalette());
      } else {
        Portrait.paintTo(canvas);
      }
    });
    // Window zoom / window resize — repaint at current DPR.
    window.addEventListener("resize", () => Portrait.paintTo(canvas));
    // Cross-monitor DPR change — reload the correct variant, then repaint.
    onDevicePixelRatioChange(async () => {
      await Portrait.load();
      Portrait.paintTo(canvas);
      Portrait.startAnimation(canvas);
    });
    document.getElementById("bio-shorter").addEventListener("click", () => {
      if (BioCtl.i > 0) { BioCtl.i--; BioCtl.repaint(); }
    });
    document.getElementById("bio-longer").addEventListener("click", () => {
      if (BioCtl.i < BioCtl.lengths.length - 1) { BioCtl.i++; BioCtl.repaint(); }
    });
    // Reroll + graphics controls live inside the portrait area now.
    document.getElementById("reroll").addEventListener("click", Palette.next);
    document.getElementById("graphics").addEventListener("click", Dither.nextMode);
    // The palette label span didn't exist when Palette.pick ran at boot;
    // re-apply the current palette so its label gets populated.
    Palette.pick(Palette.i);
    Dither._updateModeLabel();
    BioCtl.repaint();
  },

  repaint() {
    const wc = BioCtl.lengths[BioCtl.i];
    const text = BioCtl.bios[`bio${wc}`] || "";
    const body = document.getElementById("bio-body");
    body.innerHTML = MD.render(text);
    typeReveal(body);
    document.getElementById("bio-length").textContent = `${wc} words`;
    document.getElementById("bio-shorter").disabled = (BioCtl.i === 0);
    document.getElementById("bio-longer").disabled = (BioCtl.i === BioCtl.lengths.length - 1);
  },
};

// ─── Stats grid ───────────────────────────────────────────────────────────
function renderStats(p) {
  const rows = [];
  rows.push(["NAME", p.name?.canonical]);
  rows.push(["TITLE", p.title]);
  rows.push([
    "PROFESSION",
    (p.profession ? p.profession.split(",").map(s => s.trim()).filter(Boolean) : []),
  ]);
  rows.push(["LOCATION", p.location]);
  rows.push([
    "ROLES",
    (p.current_roles || []).map(r =>
      `${r.role}, ${r.organization} (${r.location})`
    ),
  ]);
  rows.push([
    "LANGUAGES",
    (p.languages || []).map(l => `${l.language} (${l.level})`),
  ]);
  for (const [label, key] of [["WEBSITES", "websites"], ["SOCIAL", "social"], ["CODE", "code"]]) {
    const items = p.links?.[key];
    if (!items || items.length === 0) continue;
    rows.push([
      label,
      items.map(w => ({
        text: w.url.replace(/^https?:\/\//, ""),
        href: w.url,
      })),
    ]);
  }

  const maxLabel = Math.max(...rows.map(([k]) => k.length));
  const indent = " ".repeat(maxLabel + 3);

  const html = rows
    .map(([k, v]) => {
      const label = `<strong>${escHtml(k.padEnd(maxLabel))}</strong> : `;
      if (Array.isArray(v)) {
        const parts = v.map(item => {
          if (typeof item === "object" && item.href) {
            return `<a href="${escHtml(item.href)}" target="_blank" rel="noopener">${escHtml(item.text)}</a>`;
          }
          return escHtml(item);
        });
        return label + parts.join(",\n" + indent);
      }
      return label + escHtml(v ?? "");
    })
    .join("\n");

  document.getElementById("stats").innerHTML = `<pre class="stats-block">${html}</pre>`;
}

// ─── Chip rail ────────────────────────────────────────────────────────────
function buildChips() {
  const rail = document.getElementById("chips");
  rail.innerHTML = DOC_ORDER
    .map(n =>
      `<button class="chip" type="button" data-doc="${n}" aria-pressed="false">[ ] ${n.replace(".md", "")}</button>`
    )
    .join("");
}

// ─── Sections (lazy, cached) ──────────────────────────────────────────────
const Sections = {
  cache: new Map(),

  async toggle(name) {
    const id = `sec-${name.replace(/\W/g, "-")}`;
    const existing = document.getElementById(id);
    const willOpen = !existing;
    syncChipState(name, willOpen);

    if (!willOpen) { existing.remove(); return; }

    if (!Sections.cache.has(name)) {
      Sections.cache.set(name, await fetchText(`compiled/${name}`));
    }
    const src = Sections.cache.get(name);
    const { body } = splitFrontmatter(src);

    const sec = document.createElement("section");
    sec.id = id;
    sec.className = "doc";
    sec.dataset.doc = name;
    sec.innerHTML = `<div class="doc-body">${MD.render(body)}</div>`;
    document.getElementById("sections").appendChild(sec);

    // Sync docref state BEFORE the typing reveal so their final labels
    // (which we set via textContent) aren't blown away mid-animation.
    for (const ref of sec.querySelectorAll(".chip[data-doc]")) {
      const refName = ref.dataset.doc;
      const open = !!document.getElementById(`sec-${refName.replace(/\W/g, "-")}`);
      setChipDisplay(ref, refName, open);
    }

    typeReveal(sec.querySelector(".doc-body"));
  },
};

function syncChipState(name, open) {
  for (const el of document.querySelectorAll(`.chip[data-doc="${CSS.escape(name)}"]`)) {
    setChipDisplay(el, name, open);
  }
}
function setChipDisplay(el, name, open) {
  el.setAttribute("aria-pressed", String(open));
  el.textContent = `[${open ? "x" : " "}] ${name.replace(".md", "")}`;
}

// ─── Export (.md, frontmatter stripped + inline metadata note) ────────────
const Export = {
  toMd() {
    const profileBlock = document.querySelector(".stats-block")?.innerText ?? "";
    const identity = document.querySelector(".identity-statement")?.textContent ?? "";
    const bio = document.getElementById("bio-body")?.innerText ?? "";
    const bioLen = BioCtl.lengths[BioCtl.i];

    const parts = [
      `# Luka Piškorec — Curriculum Vitae`,
      ``,
      `> _exported: ${new Date().toISOString().slice(0, 10)} · source: ${location.href}_`,
      ``,
      identity,
      ``,
      `## Bio (~${bioLen} words)`,
      ``,
      bio,
      ``,
      `## Stats`,
      ``,
      "```",
      profileBlock,
      "```",
    ];

    for (const sec of document.querySelectorAll(".doc")) {
      const name = sec.dataset.doc;
      const src = Sections.cache.get(name);
      if (!src) continue;
      const { meta, body } = splitFrontmatter(src);
      const metaLine = `> _from: ${name} · last-updated: ${meta.last_updated ?? "?"}${meta.type ? ` · type: ${meta.type}` : ""}_`;
      parts.push(``, `==[ FF ]==`, ``, `## ${name}`, ``, metaLine, ``, body.trim());
    }
    return parts.join("\n") + "\n";
  },

  download() {
    const blob = new Blob([Export.toMd()], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "luka-piskorec-cv.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
};

// ─── Boot ─────────────────────────────────────────────────────────────────
async function boot() {
  Palette.pick();
  Paper.init();
  document.getElementById("export").addEventListener("click", Export.download);

  // Delegated chip / docref click handler (covers rail + in-section refs).
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip[data-doc]");
    if (btn && !btn.disabled) Sections.toggle(btn.dataset.doc);
  });

  await preloadDocList();

  const profileSrc = await fetchText("compiled/profile.md");
  const { meta: profileMeta } = splitFrontmatter(profileSrc);

  Banner.init(document.getElementById("banner"));

  // Initial typing reveal — fire each section's reveal as soon as its DOM is
  // populated. typeReveal is fire-and-forget (setTimeout-driven), so the
  // sections type in parallel from this point onward.
  await renderIdentity(profileMeta);
  typeReveal(document.getElementById("identity"));

  await BioCtl.render();  // bio-body types via BioCtl.repaint

  renderStats(profileMeta);
  typeReveal(document.getElementById("stats"));

  buildChips();
  typeReveal(document.getElementById("chips"));
}

boot().catch(e => console.error(e));
