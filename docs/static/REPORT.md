# Report: Building the Static Mirror of the DCE

*2026-07-09 — planning, implementation, and testing of the static HTML mirror generator (`scripts/static_site/`, invoked as `node scripts/lizard.js static <target>`). See [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) in this directory for the build/deploy runbook, and [README.md](README.md) for the architecture overview.*

## 1. Planning

**Exploration.** Before proposing anything, three read-only exploration passes were run over the codebase in parallel, each with a different focus: (a) app architecture — the tech stack, every route, and how the build/deploy pipeline works; (b) an inventory of all client-side interactivity that would need to survive without React; (c) the content pipeline — where the data comes from and what shape it's in.

The load-bearing discovery came out of that: **the content layer was already fully static.** The lizard.js pipeline generates ~2,843 files per build (folio transcription HTML, essay HTML, entries/glossary/comments JSON, an IIIF manifest, prebuilt lunr search indexes). Only the *shell* was dynamic — a client-rendered React SPA that fetches those files and assembles pages at runtime. That reframed the whole project from "serialize a React app" to "wrap already-static content in static shells," which is a much smaller and more reliable job.

**Scope decisions.** Four choices genuinely changed the architecture, so they were decided with the project owner up front:

- *Purpose*: parallel static mirror alongside the SPA (not a replacement, not just an archive)
- *Folio viewer*: one page per folio with a JS pane-switcher, since two-pane URLs (340 folios × 6 pane types × 2 panes) are combinatorial and can't each be a file
- *Build method*: a new generator inside the existing lizard.js pipeline, rendering from the data artifacts — rather than crawling the running React app with a headless browser (snapshots are brittle: MUI class-name churn, leftover React attributes, and the interactivity would still need rewriting anyway)
- *Search*: keep client-side lunr with the existing indexes

**Design and verification.** The decisions were then turned into a concrete design: output layout, URL scheme (`staticBasePath` per target, so `""` locally and `/static` in production), a module map, a page inventory with per-type generation logic, and the deploy path. Before committing to the plan, its riskiest assumptions were verified directly in the code: that lizard.js's command dispatch was easy to extend, that jsdom and lunr were already dependencies (they were — the generator added **zero** new dependencies), and that the layout engine really did emit React-specific `className=` attributes that a port would need to fix.

## 2. Implementation

Work was structured as five milestones, each ending with a full generation run:

- **M1 — Scaffold + content.** The `lizard.js static <target>` subcommand, config keys, and the core modules: `context.js` (data loading, URL helpers, and `rewriteHref` — the single function that maps every SPA-style link, including legacy `#/...` hash URLs, onto mirror URLs), `layout.js` (page shell with header/nav/footer, CC-license SVGs inlined), the home page, and content pages wrapped in the ContentPage chrome with anchor side-navs.
- **M2 — Essays + entries.** Essay index grouped by theme, 134 essay pages with bylines joined from `authors.json`, and the 928-entry list as one crawlable page.
- **M3 — Folios** (the substantial piece). Build-time ports of three runtime systems: `parseTranscription` from `Folio.js`, the margin-layout grid engine from `folioLayout.js` (kept *bug-compatible* — including its `&`-vs-`&&` quirk and trailing-space grid rows — except the `className` → `class` fix), and the ~30-tag TEI-ish transform table from `TranscriptionView.js`. Each folio page embeds all three transcription versions as real HTML (crawlable without JS) plus a JSON payload with the Gallica IIIF URL and that page's editorial comments. Three vanilla JS modules recreate the viewer: `panes.js` (~200 lines — pane switching, hash state, divider drag, jump-to-folio), `facsimile.js` (OpenSeadragon init), `comments.js` (popups).
- **M4 — Glossary + search.** The full 1,197-term glossary with a client-side filter, and `search.js`, a line-faithful port of `SearchIndex.js` including its phrase-match filter, lazy-loading the ~30 MB of indexes on first search.
- **M5 — Hardening + docs.** Link checker, browser verification (below), the BUILD_AND_DEPLOY.md deploy section, and the robots.txt sitemap line.

A recurring implementation principle: **reuse the SPA's compiled CSS verbatim** by emitting the same class names it uses, so rendering matches nearly for free; a single hand-written `static.css` replaces only what Material-UI injected at runtime.

## 3. Testing

Testing happened at three levels:

**Automatic checks on every build** (`scripts/static_site/check.js`, runs at the end of each generate): page-count assertions against the source data (340 folios, 134 essays…), a scan of all output for unconverted custom tags or `className=` residue, an internal-link check that resolves every href/src on all 490 pages against the output tree and data tree, and sitemap↔filesystem parity. This caught real issues during development and settled at 15 findings — all pre-existing broken links in the essay *source* HTML, equally broken in the live SPA.

**End-to-end browser verification.** `static-build/` was served locally and driven in real Chrome via Playwright: home, content pages, essays (including footnote jumps), entries, the folio grid, and the folio viewer in depth — pane switching updating the hash, deep links like `#tl/tcn` restoring both panes, divider drag, comment popups showing the right editorial note, jump-to-folio, prev/next carrying pane state — plus the glossary filter and searches including a phrase query. Off-happy-path probes: a **no-JS page load** (confirming crawlers get all three transcriptions), garbage search input, and an invalid folio jump.

**Fidelity checks against the SPA's behavior.** Where output looked surprising, it was checked against the original rather than assumed to be a bug: search returning only 2 translation hits for "coral" was confirmed correct by running raw lunr over the same index in Node; the glossary filter showing nothing for "corail" turned out to be correct because no such headword exists.

The browser pass found two genuine bugs, both fixed and re-verified: CSS had collapsed the editorial-comment `*` buttons to zero height (invisible and unclickable), and an invalid jump-to-folio input navigated to a 404 instead of being rejected (now validated against the embedded folio-name list).

Finally, the working knowledge was persisted: `.claude/skills/verify/SKILL.md` with the build/serve/drive recipe (and its gotchas, like Gallica rate-limiting headless thumbnail bursts), and the deploy runbook in BUILD_AND_DEPLOY.md.

**State as of this report:** 490 pages generating cleanly in ~20 s, verified locally (`python3 -m http.server 8642 --directory static-build` → http://localhost:8642/), not yet committed or deployed.

## Known issues / upstream notes

- ~15 broken links ship in the essay source HTML in `m-k-annotation-data` (e.g. `/essays/ann_022_sp_15.` with a trailing period, retired `/content/research+resources/...` routes, a reference to nonexistent folio 188r, malformed markup in `ann_060_fa_17`). Also broken in the SPA; fixing them is upstream data work.
- Folio figure images carry a `classname=` (not `class`) attribute from the conversion pipeline, so the intended `.small-inline-figure` sizing CSS never applies — in the SPA either. Preserved for parity; the fix belongs in `scripts/convert.js`.
- Gallica rate-limits (HTTP 429) the folio grid's thumbnail burst when many load at once; real scrolling is gentler.
- Deliberate scope cuts vs the SPA: XML pane view and book mode are not reproduced (each transcription links to its `original.txt` TEI source instead); in-folio search-term highlighting is reduced to highlighted search-result snippets.
