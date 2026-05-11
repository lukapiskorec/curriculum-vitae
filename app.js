// Typewriter CV — Luka Piskorec
// Entry module. See PLAN.md for the task breakdown.

// ─── Palette ──────────────────────────────────────────────────────────────
// Two-color paper+ink combinations. No accents, no shades.
const PALETTES = [
  ["#f4ecd8", "#1a1a1a"], // manuscript
  ["#f1e3c6", "#4a2c0f"], // sepia
  ["#e9d8a6", "#2d1b00"], // manila
  ["#e0e9f5", "#0b3d6b"], // cyanotype
  ["#f2eee6", "#3d2a72"], // mimeograph
  ["#f7f3ea", "#6b1a0a"], // carbon
  ["#e8e6e1", "#111111"], // newsprint
  ["#f4eda3", "#1b3a5b"], // legal pad
  ["#ece6d7", "#08234a"], // oxford
  ["#ede7d3", "#2b3a1f"], // botanical
];

const Palette = {
  i: 0,
  pick(n = Math.floor(Math.random() * PALETTES.length)) {
    Palette.i = n;
    const [paper, ink] = PALETTES[n];
    document.documentElement.style.setProperty("--paper", paper);
    document.documentElement.style.setProperty("--ink", ink);
  },
  next() {
    Palette.pick((Palette.i + 1) % PALETTES.length);
  },
};

// ─── Frontmatter ──────────────────────────────────────────────────────────
// Minimal YAML reader for the subset used by compiled/*.md:
//   - flat `key: value` scalars
//   - nested objects (indented `key:` under a parent)
//   - arrays of flow-style objects `- { k: v, k: v }`
//   - scalar string arrays `- value`

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
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  const root = {};
  const stack = [{ container: root, indent: -1 }];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].container;

    if (line.startsWith("- ")) {
      const rest = line.slice(2).trim();
      if (!Array.isArray(parent)) continue;
      if (rest.startsWith("{")) {
        parent.push(parseFlowObject(rest));
      } else {
        parent.push(parseScalar(rest));
      }
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
    if (q) {
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      continue;
    }
    if (c === ":") return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
  }
  return [line, ""];
}

function parseScalar(s) {
  if (!s) return "";
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
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
  const parts = [];
  let cur = "",
    q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      cur += c;
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") {
      q = c;
      cur += c;
      continue;
    }
    if (c === "," && !q) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ─── Banner ───────────────────────────────────────────────────────────────
// FIGlet "banner3-D" rendering of CURRICULUM / VITAE (stacked).
// Generated offline; embedded verbatim.

const BANNER_LINES = [
  ":'######::'##::::'##:'########::'########::'####::'######::'##::::'##:'##:::::::'##::::'##:'##::::'##:",
  "'##... ##: ##:::: ##: ##.... ##: ##.... ##:. ##::'##... ##: ##:::: ##: ##::::::: ##:::: ##: ###::'###:",
  " ##:::..:: ##:::: ##: ##:::: ##: ##:::: ##:: ##:: ##:::..:: ##:::: ##: ##::::::: ##:::: ##: ####'####:",
  " ##::::::: ##:::: ##: ########:: ########::: ##:: ##::::::: ##:::: ##: ##::::::: ##:::: ##: ## ### ##:",
  " ##::::::: ##:::: ##: ##.. ##::: ##.. ##:::: ##:: ##::::::: ##:::: ##: ##::::::: ##:::: ##: ##. #: ##:",
  " ##::: ##: ##:::: ##: ##::. ##:: ##::. ##::: ##:: ##::: ##: ##:::: ##: ##::::::: ##:::: ##: ##:.:: ##:",
  ". ######::. #######:: ##:::. ##: ##:::. ##:'####:. ######::. #######:: ########:. #######:: ##:::: ##:",
  ":......::::.......:::..:::::..::..:::::..::....:::......::::.......:::........:::.......:::..:::::..::",
  "",
  "'##::::'##:'####:'########::::'###::::'########:",
  " ##:::: ##:. ##::... ##..::::'## ##::: ##.....::",
  " ##:::: ##:: ##::::: ##:::::'##:. ##:: ##:::::::",
  " ##:::: ##:: ##::::: ##::::'##:::. ##: ######:::",
  ". ##:: ##::: ##::::: ##:::: #########: ##...::::",
  ":. ## ##:::: ##::::: ##:::: ##.... ##: ##:::::::",
  "::. ###::::'####:::: ##:::: ##:::: ##: ########:",
  ":::...:::::....:::::..:::::..:::::..::........::",
];

const Banner = {
  render(target) {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = Math.max(...BANNER_LINES.map((l) => l.length));
    const final = BANNER_LINES.map((l) => l.padEnd(width, " "));

    const pre = document.createElement("pre");
    pre.className = "banner-art";
    const name = document.createElement("div");
    name.className = "banner-name";
    name.textContent = "L U K A   P I Š K O R E C";
    target.replaceChildren(pre, name);

    if (reduced) {
      pre.textContent = final.join("\n");
      return;
    }

    const out = final.map((l) => " ".repeat(l.length).split(""));
    const rowsChars = final.map((l) => l.split(""));
    let col = 0;
    const tick = () => {
      if (col >= width) return;
      for (let r = 0; r < rowsChars.length; r++) {
        out[r][col] = rowsChars[r][col];
      }
      pre.textContent = out.map((r) => r.join("")).join("\n");
      col++;
      setTimeout(tick, 12);
    };
    tick();
  },
};

// ─── HTTP + escape helpers ────────────────────────────────────────────────
async function fetchText(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.text();
}

function escHtml(s) {
  return String(s).replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );
}

// ─── Markdown (light parse) ───────────────────────────────────────────────
// Supports: paragraphs, headings (1–3), unordered/ordered lists, fenced code,
// pipe tables (rendered as monospace pre-blocks), horizontal rules, and inline
// bold / italic / inline code / links. Italic uses *...* only; underscore-
// wrapped words are left as-is (so `_education` style labels survive).

const MD = {
  render(src) {
    const lines = src.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i].trim()) { i++; continue; }

      // Fenced code
      if (lines[i].startsWith("```")) {
        const code = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          code.push(lines[i]);
          i++;
        }
        i++;
        out.push(`<pre class="md-code">${escHtml(code.join("\n"))}</pre>`);
        continue;
      }

      // Heading
      const h = lines[i].match(/^(#{1,3})\s+(.+)$/);
      if (h) {
        out.push(`<h${h[1].length}>${inlineMd(h[2])}</h${h[1].length}>`);
        i++;
        continue;
      }

      // Horizontal rule
      if (/^-{3,}\s*$/.test(lines[i])) {
        out.push(`<hr>`);
        i++;
        continue;
      }

      // Table (line with pipes followed by a separator row)
      if (
        lines[i].includes("|") &&
        i + 1 < lines.length &&
        /^\s*\|?[\s\-:|]+\|/.test(lines[i + 1])
      ) {
        const tbl = [];
        while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
          tbl.push(lines[i]);
          i++;
        }
        out.push(`<pre class="md-table">${escHtml(tbl.join("\n"))}</pre>`);
        continue;
      }

      // Unordered list
      if (/^[-*]\s+/.test(lines[i])) {
        const items = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
          let item = lines[i].replace(/^[-*]\s+/, "");
          i++;
          while (i < lines.length && /^\s{2,}\S/.test(lines[i])) {
            item += " " + lines[i].trim();
            i++;
          }
          items.push(item);
        }
        out.push(
          `<ul>${items.map((it) => `<li>${inlineMd(it)}</li>`).join("")}</ul>`,
        );
        continue;
      }

      // Ordered list
      if (/^\d+\.\s+/.test(lines[i])) {
        const items = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s+/, ""));
          i++;
        }
        out.push(
          `<ol>${items.map((it) => `<li>${inlineMd(it)}</li>`).join("")}</ol>`,
        );
        continue;
      }

      // Paragraph
      const para = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^#{1,3}\s/.test(lines[i]) &&
        !/^[-*]\s+/.test(lines[i]) &&
        !/^\d+\.\s+/.test(lines[i]) &&
        !lines[i].startsWith("```") &&
        !/^-{3,}\s*$/.test(lines[i])
      ) {
        para.push(lines[i]);
        i++;
      }
      if (para.length) out.push(`<p>${inlineMd(para.join(" "))}</p>`);
    }
    return out.join("\n");
  },
};

function inlineMd(s) {
  s = escHtml(s);
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\x00C${codes.length - 1}\x00`;
  });
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`,
  );
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, "<em>$1</em>");
  s = s.replace(/\x00C(\d+)\x00/g, (_, n) => `<code>${codes[Number(n)]}</code>`);
  return s;
}

// ─── Profile ──────────────────────────────────────────────────────────────
const PORTRAIT_PLACEHOLDER = [
  "+----------------+",
  "|                |",
  "|   +--------+   |",
  "|   |        |   |",
  "|   |  L.P.  |   |",
  "|   |        |   |",
  "|   +--------+   |",
  "|                |",
  "|    PORTRAIT    |",
  "|    PENDING..   |",
  "|                |",
  "+----------------+",
].join("\n");

async function renderProfile() {
  const src = await fetchText("compiled/profile.md");
  const { meta } = splitFrontmatter(src);

  const name = meta.name?.canonical ?? "Luka Piškorec";
  const langs = (meta.languages || [])
    .map((l) => `${l.language} (${l.level})`)
    .join(", ");
  const sites = (meta.links?.websites || [])
    .map((w) => w.url.replace(/^https?:\/\//, ""))
    .join("   ");
  const roles = (meta.current_roles || [])
    .map((r) => `${r.role}, ${r.organization} (${r.location})`)
    .join("; ");

  const rows = [
    ["NAME", name],
    ["TITLE", meta.title],
    ["PROFESSION", meta.profession],
    ["LOCATION", meta.location],
    ["ROLES", roles],
    ["LANGUAGES", langs],
    ["LINKS", sites],
  ];

  const width = Math.max(...rows.map(([k]) => k.length));
  const grid = rows
    .map(([k, v]) => `${k.padEnd(width)} : ${v ?? ""}`)
    .join("\n");

  document.getElementById("profile").innerHTML = `
    <div class="profile-row">
      <pre class="portrait">${escHtml(PORTRAIT_PLACEHOLDER)}</pre>
      <pre class="profile-block">${escHtml(grid)}</pre>
    </div>`;
}

// ─── Sections (lazy, cached) ──────────────────────────────────────────────
const Sections = {
  cache: new Map(), // name -> parsed source text
  async toggle(name, btn) {
    const open = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", String(!open));
    btn.textContent = `[${open ? " " : "x"}] ${name.replace(".md", "")}`;
    const id = `sec-${name.replace(/\W/g, "-")}`;
    const existing = document.getElementById(id);
    if (open) {
      existing?.remove();
      return;
    }
    if (!Sections.cache.has(name)) {
      Sections.cache.set(name, await fetchText(`compiled/${name}`));
    }
    const src = Sections.cache.get(name);
    const { meta, body } = splitFrontmatter(src);
    const sec = document.createElement("section");
    sec.id = id;
    sec.className = "doc";
    sec.dataset.doc = name;
    sec.innerHTML = `
      <header class="doc-head">─── FILE: ${escHtml(name)} ─── UPDATED: ${escHtml(meta.last_updated ?? "?")} ───</header>
      <div class="doc-body">${MD.render(body)}</div>
      <footer class="doc-foot">─── EOF ───</footer>`;
    document.getElementById("sections").appendChild(sec);
  },
};

// ─── Chip rail ────────────────────────────────────────────────────────────
async function buildChips() {
  const src = await fetchText("compiled/index.md");
  const ordered = [];
  const seen = new Set();
  for (const m of src.matchAll(/\[`([a-z][a-z0-9-]*\.md)`\]/g)) {
    const name = m[1];
    if (name === "profile.md" || name === "index.md") continue;
    if (seen.has(name)) continue;
    seen.add(name);
    ordered.push(name);
  }
  const rail = document.getElementById("chips");
  rail.innerHTML = ordered
    .map(
      (n) =>
        `<button class="chip" type="button" data-doc="${n}" aria-pressed="false">[ ] ${n.replace(".md", "")}</button>`,
    )
    .join("");
  rail.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (b) Sections.toggle(b.dataset.doc, b);
  });
}

// ─── Export ───────────────────────────────────────────────────────────────
// Concatenate the profile (as a fenced plain-text block) + raw .md source for
// every currently-open section. Form-feed marker between sections. Raw source
// is preserved so machine readers see what the compiled docs actually say.

const Export = {
  toMd() {
    const profile = document.querySelector(".profile-block")?.textContent ?? "";
    const parts = [
      `# Luka Piškorec — Curriculum Vitae`,
      ``,
      `Exported: ${new Date().toISOString().slice(0, 10)}`,
      `Source: ${location.href}`,
      ``,
      "```",
      profile,
      "```",
    ];
    for (const sec of document.querySelectorAll(".doc")) {
      const name = sec.dataset.doc;
      const src = Sections.cache.get(name);
      if (!src) continue;
      parts.push(``, `==[ FF ]==`, ``, `## ${name}`, ``, src.trim());
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
  Banner.render(document.getElementById("banner"));
  await renderProfile();
  await buildChips();
}

boot().catch((e) => console.error(e));
