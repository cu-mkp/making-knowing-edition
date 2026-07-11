# Static HTML Mirror of the Digital Critical Edition

A fully static, React-free mirror of *Secrets of Craft and Nature in
Renaissance France* — every page serialized as plain HTML, styled by the
edition's existing CSS, with small vanilla-JS modules only where functionality
requires them (facsimile deep-zoom, pane switching, search, popups). It is
published **alongside** the React SPA (under `/mirror/`) for crawlability and
durability; the SPA remains the primary interface.

## Documents

| Doc | What it covers |
|---|---|
| [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) | How to build, preview locally, and deploy the mirror |
| [REPORT.md](REPORT.md) | How the project was planned, implemented, and tested; known issues |
| [`.claude/skills/verify/SKILL.md`](../../.claude/skills/verify/SKILL.md) | Recipe for driving the mirror in a browser for verification |

## How it works

The edition's content is already static: the lizard.js pipeline generates
~2,800 files per build under `public/bnf-ms-fr-640/<buildID>/` (folio
transcription HTML, essay HTML, entries/glossary/comments JSON, IIIF manifest,
lunr search indexes). Only the SPA shell is dynamic. The mirror generator
(`scripts/static_site/`, run as `node scripts/lizard.js static <target>`)
wraps that content in static page shells at build time — no headless-browser
crawling, no new dependencies (it uses the jsdom and lunr already in
`scripts/package.json`).

### Module map (`scripts/static_site/`)

| Module | Responsibility |
|---|---|
| `generate.js` | Orchestrator: loads data, runs page generators, copies assets, writes sitemap, runs checks |
| `context.js` | Shared model: data loading, folio list from the IIIF manifest, URL helpers, `rewriteHref` (maps every SPA-style link — including legacy `#/...` hash URLs — onto mirror URLs) |
| `layout.js` | HTML page shell: header/nav from `menu-structure.json`, footer, inline SVG icons, canonical/meta tags |
| `transcription.js` | Build-time port of the TEI-ish tag transforms from `src/component/TranscriptionView.js` |
| `folio_layout.js` | Build-time port of the margin-layout grid engine from `src/model/folioLayout.js` (bug-compatible, with the `className`→`class` fix) |
| `essay_card.js` | Essay card markup shared by home page and essay index |
| `pages/*.js` | One generator per page type: home, content, essay_index, essay, entries, folio_index, folio, glossary, search |
| `sitemap.js`, `assets.js`, `check.js` | Sitemap emission; CSS/JS/img/vendor copying; post-build verification |
| `assets/js/*.js` | Shipped vanilla JS: `panes.js` (two-pane folio viewer), `facsimile.js` (OpenSeadragon), `comments.js` (editorial-comment popups), `search.js` (lunr port), `glossary.js` (filter), `menu.js` (mobile nav) |
| `assets/css/static.css` | Hand-written chrome CSS replacing what Material-UI injected at runtime (everything else reuses the compiled `public/css/index.css` verbatim) |

### Page inventory (~490 pages)

- `/` home; `/content/<id>/` for each content fragment
- `/essays/` index + `/essays/<annoID>/` × 134
- `/entries/` — all 928 entries on one crawlable page
- `/folios/` thumbnail grid + `/folios/<name>/` × 340 — each folio page embeds
  the facsimile pane definition and all three transcription versions as real
  HTML (stacked and fully readable without JS); with JS, `panes.js` builds the
  two-pane viewer with pane state in the hash (`#f/tl`)
- `/glossary/` (1,197 terms, A–Z anchors, client-side filter)
- `/search/?q=...` (client-side lunr over the existing prebuilt indexes,
  loaded lazily on first search)
- `sitemap.xml`

### URL scheme

All internal links go through `urlFor()`/`assetURL()` in `context.js` with a
per-target `staticBasePath` (`""` locally, `"/mirror"` deployed). Edition data
(search indexes, figures, thumbnails) is referenced at its existing
root-relative `/bnf-ms-fr-640/<buildID>/...` paths — the mirror does not
duplicate the 1.6 GB data tree. Facsimile tiles come from Gallica IIIF, as in
the SPA.
