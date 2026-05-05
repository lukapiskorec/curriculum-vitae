# curriculum-vitae

A knowledge database of CV-related text documents for Luka Piškorec, compiled from raw source materials into standardized, parsable markdown. The compiled docs are designed to serve as a single source of truth for tailored CVs, application bios, exhibition statements, and a future CV website.

## Layout

- `source documents/` — raw source documents (CVs, bios, project descriptions, essays). **Gitignored.** May contain personally identifiable information.
- `compiled/` — standardized, redacted, cross-linked markdown documents derived from the sources. Tracked in git. Safe to publish.

## Compiled documents

| File | Purpose |
|---|---|
| [`profile.md`](compiled/profile.md) | Single source of truth for personal data, current roles, links, languages, identity statement. Anchors every other doc. |
| [`bios.md`](compiled/bios.md) | Canonical biographical text at standard lengths (~30w / ~150w / ~250w / ~500w). Reusable in applications. |
| [`education.md`](compiled/education.md) | Degrees and secondary education, including the paused PhD. |
| [`employment.md`](compiled/employment.md) | Current and past positions, internships, and co-founder roles. |
| [`affiliations.md`](compiled/affiliations.md) | Profile and role descriptions for {protocell:labs}, TEN Studio, Gramazio Kohler Research, and Aalto Design of Structures. |
| [`built-works.md`](compiled/built-works.md) | Physical built works and installations 2010–2018. Materials, process, venue, collaborators per item. |
| [`generative-collections.md`](compiled/generative-collections.md) | Long-form and short-form generative collections 2021–2024. Edition counts, platforms, chains, collaborators. |
| [`coded-works.md`](compiled/coded-works.md) | Coded projects beyond generative collections (placeholder roster, format template documented). |
| [`exhibitions.md`](compiled/exhibitions.md) | External exhibition appearances of works listed in `built-works.md` and `generative-collections.md`. |
| [`publications.md`](compiled/publications.md) | Peer-reviewed papers, articles and interviews, "featured in" books, workshop publications, and the unpublished book draft. |
| [`teaching.md`](compiled/teaching.md) | Regular university teaching, conducted courses and workshops, mentored MSc theses. |
| [`awards-and-grants.md`](compiled/awards-and-grants.md) | Awards, prize shortlists, and research grants. |
| [`talks-and-juries.md`](compiled/talks-and-juries.md) | Public lectures, recorded talks, and jury memberships. |
| [`writings.md`](compiled/writings.md) | Long-form essays and interviews preserved as canonical text, plus a working list of external articles and features. |
| [`principles.md`](compiled/principles.md) | Distilled intellectual tenets drawn from `writings.md`. |
| [`index.md`](compiled/index.md) | Catalog and source-to-compiled mapping. |

## Conventions

- **PII**: never appears under `compiled/`. Email, phone, address, exact date of birth, city of birth, and family details are redacted on compile. Year of birth and country are acceptable.
- **Spelling**: `Piškorec` (with diacritic) is canonical for compiled docs and citation bylines. `Piskorec` (simplified) is used in social handles, email, and URLs and is acceptable in ASCII-only contexts.
- **Cross-references**: compiled docs link to one another by relative path. The same project may appear in multiple compiled docs (built-works ↔ exhibitions ↔ publications ↔ teaching) connected by cross-links rather than de-duplicated.
- **Frontmatter**: every compiled doc carries a YAML frontmatter block with `type`, `last_updated`, and a brief description; timeline docs additionally use per-item heading sections (`## Title (Year)`) with bullet metadata for parsability.
- **Languages**: English-only at present. Finnish parallels may be compiled later from the existing `Ansioluettelo` source.
