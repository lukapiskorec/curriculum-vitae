---
type: index
last_updated: 2026-05-05
description: Catalog of compiled CV documents and a mapping from source documents (raw, gitignored) to the compiled outputs they informed.
---

# Index — Compiled CV documents

This folder is a knowledge database compiled from raw source documents in `../source documents/`. The `source documents/` folder is gitignored and may contain PII; everything tracked under `compiled/` is sanitised and intended to be safe to publish.

The compiled docs are designed to be both human-readable and machine-parsable: most files use YAML frontmatter for structured metadata and section-stable markdown bodies. They serve as a single source of truth for building tailored CVs, application bios, exhibition statements, or a CV website.

---

## Compiled documents

| File | Purpose |
|---|---|
| [`profile.md`](profile.md) | Single source of truth for personal data, current roles, links, languages, identity statement. Anchors every other doc. |
| [`bios.md`](bios.md) | Canonical biographical text at standard lengths (~30w / ~150w / ~250w / ~500w). Reusable in applications. |
| [`education.md`](education.md) | Degrees and secondary education, including the paused PhD. |
| [`employment.md`](employment.md) | Current and past positions, internships, and co-founder roles. |
| [`affiliations.md`](affiliations.md) | Profile and role descriptions for {protocell:labs}, TEN Studio, Gramazio Kohler Research, and Aalto Design of Structures. |
| [`built-works.md`](built-works.md) | Physical built works and installations 2010–2018. Materials, process, venue, collaborators per item. |
| [`generative-collections.md`](generative-collections.md) | Long-form and short-form generative collections 2021–2024. Edition counts, platforms, chains, collaborators. |
| [`coded-works.md`](coded-works.md) | Coded projects beyond generative collections (placeholder roster, format template documented). |
| [`exhibitions.md`](exhibitions.md) | External exhibition appearances of works listed in `built-works.md` and `generative-collections.md`. |
| [`publications.md`](publications.md) | Peer-reviewed papers, articles and interviews, "featured in" books, workshop publications, and the unpublished book draft. |
| [`teaching.md`](teaching.md) | Regular university teaching, conducted courses and workshops, mentored MSc theses. |
| [`awards-and-grants.md`](awards-and-grants.md) | Awards, prize shortlists, and research grants. |
| [`talks-and-juries.md`](talks-and-juries.md) | Public lectures, recorded talks, and jury memberships. |
| [`writings.md`](writings.md) | Long-form essays and interviews preserved as canonical text, plus a working list of external articles and features. |
| [`principles.md`](principles.md) | Distilled intellectual tenets (16 entries) drawn from `writings.md`. |
| [`index.md`](index.md) | This file. |

---

## Source-to-compiled mapping

Each source document under `../source documents/` and the compiled file(s) it primarily informed. Use this mapping to find which compiled doc to update if a source is revised.

| Source document | Type | Informed |
|---|---|---|
| `200605_LukaPiskorec_short_bio` | Short bio (2020) | `bios.md` |
| `2022_LukaPiskorec_ShortBio` | Short bio (2022) | `bios.md` |
| `2023_protocell_labs_bio` | Lab bio | `affiliations.md`, `bios.md`, `principles.md` (open code) |
| `2023_protocell_labs_and_office_ca_collaboration` | Lab + collaboration bio | `affiliations.md`, `exhibitions.md` (Structura context) |
| `2024_LukaPiskorec_ShortBio` | Short bio (2024) | `bios.md` |
| `2024_protocell_labs_info` | Lab profile (refined) | `affiliations.md`, `principles.md` (open code) |
| `2024_SPACE_21_protocell_labs_description` | Venue-specific lab description | `affiliations.md`, `bios.md` |
| `2024_ArtBlocks_application` | Application bundle | `bios.md`, `talks-and-juries.md`, `publications.md` |
| `2025_LukaPiskorec_ShortBio` | Short bio (2025, latest) | `bios.md`, `profile.md`, `affiliations.md` |
| `230611_GenerativeArchitecture_JournalAnswers` | Interview Q&A (Verse Works) | `writings.md`, `principles.md`, `publications.md` |
| `241007_Artist_and_Computer_Luka_Piskorec_draft` | Long-form essay draft | `writings.md`, `principles.md`, `publications.md` (book draft) |
| `CV_EXTENDED_Luka Piskorec_2019` | Most exhaustive CV | `built-works.md`, `teaching.md`, `publications.md`, `awards-and-grants.md`, `employment.md`, `education.md` |
| `CV_SHORT_Luka Piskorec_2022` | Short CV (2022) | `bios.md`, `employment.md` |
| `CV_SHORT_Luka Piskorec_2022_Arial_font` | Duplicate of 2022 (font variant) | *(unused — content identical to above)* |
| `CV_SHORT_Luka Piskorec_2024` | Short CV with artistic activities | `generative-collections.md`, `built-works.md`, `talks-and-juries.md`, `awards-and-grants.md` |
| `CV_SHORT_Luka Piskorec_2025` | Short CV with extended activities | `generative-collections.md`, `built-works.md`, `exhibitions.md`, `profile.md` |
| `CV_TENK_Luka Piskorec_2026` | Academic CV (TENK format) | `publications.md`, `awards-and-grants.md`, `employment.md`, `exhibitions.md`, `talks-and-juries.md`, `teaching.md` |
| `Ansioluettelo_LukaPiskorec_2026` | Finnish translation of CV_TENK_2026 | *(unused as primary source — kept for future Finnish compile)* |

---

## Folder conventions

- **Path layout**: source under `../source documents/` (gitignored); compiled here under `compiled/`.
- **PII**: never appears under `compiled/`. Email, phone, address, exact DoB, city of birth, family details are redacted from source on compile. Year of birth and country are acceptable.
- **Spelling**: `Piškorec` (with diacritic) is canonical for compiled docs and citation bylines. `Piskorec` (simplified) is used in social handles, email, and URLs and is acceptable in ASCII-only contexts.
- **Cross-references**: compiled docs link to one another by relative path. The same project may appear in multiple compiled docs (built-works ↔ exhibitions ↔ publications ↔ teaching) connected by cross-links rather than de-duplicated.
- **Frontmatter**: every compiled doc carries a YAML frontmatter block with `type`, `last_updated`, and a brief description; timeline docs additionally use per-item heading sections (`## Title (Year)`) with bullet metadata for parsability.
- **Languages**: English-only at present. Finnish parallels may be compiled later; the source `Ansioluettelo_LukaPiskorec_2026.docx` is preserved as input for that.
