---
name: verify
description: Build, serve, and drive the static mirror (and where to find the React app) for verification.
---

# Verifying changes in this repo

## Static mirror (scripts/static_site/)

Build (any Node ≥14 works for the generator; data must exist in
`public/bnf-ms-fr-640/<buildID>/` per `edition_data/config.json`):

```bash
node scripts/lizard.js static local
```

Output goes to `static-build/` with basePath "" for the local target, and a
`static-build/bnf-ms-fr-640` symlink into `public/` so one server serves both
pages and edition data:

```bash
python3 -m http.server 8642 --directory static-build
```

Drive with Playwright using system Chrome (no browser download):

```bash
cd dependencies && npm install     # once; then
node -e "require('./dependencies/node_modules/playwright').chromium.launch({channel:'chrome'})..."
```

Flows worth driving: home featured cards; `/content/about/` side nav;
`/essays/ann_001_fa_14/` byline + footnotes; `/folios/3r/` (pane select,
`#f/tl` hash, divider drag, editorial-comment `*` popup, jump-to-folio,
no-JS stacked view via `javaScriptEnabled: false`); `/glossary/` filter
(use a French prefix like "cor" — headwords are French); `/search/?q=coral`
(first search fetches ~30 MB of lunr indexes, allow 60-90s).

Gotchas:
- Use `domcontentloaded`, not `networkidle` — pages embed Vimeo iframes and
  Gallica images that keep the network busy indefinitely.
- Gallica rate-limits (429) the folio-grid thumbnail burst in headless runs;
  filter gallica.bnf.fr out of failure captures.
- The post-build `check.js` already validates page counts, residual custom
  tags, internal links, and sitemap parity on every generate; ~15 "broken
  internal link" reports in /essays/ are pre-existing typos in essay source
  HTML, not generator bugs.

## React app (src/)

Requires Node 14.21.3 (node-sass) — see BUILD_AND_DEPLOY.md. `yarn start`
serves on port 4000.
