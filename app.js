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
    Palette.subs.push(() => Portrait.paintTo(canvas));
    // Window zoom / window resize — repaint at current DPR.
    window.addEventListener("resize", () => Portrait.paintTo(canvas));
    // Cross-monitor DPR change — reload the correct variant, then repaint.
    onDevicePixelRatioChange(async () => {
      await Portrait.load();
      Portrait.paintTo(canvas);
    });
    document.getElementById("bio-shorter").addEventListener("click", () => {
      if (BioCtl.i > 0) { BioCtl.i--; BioCtl.repaint(); }
    });
    document.getElementById("bio-longer").addEventListener("click", () => {
      if (BioCtl.i < BioCtl.lengths.length - 1) { BioCtl.i++; BioCtl.repaint(); }
    });
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
  document.getElementById("reroll").addEventListener("click", Palette.next);
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
