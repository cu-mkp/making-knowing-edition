# Search-Engine Indexing of the Research Essays: Investigation & Recommendations

*2026-07-10 — investigation of how the DCE's 134 research essays are currently
indexed by search engines, and how the static mirror can make them
discoverable. Companion to [README.md](README.md) (mirror architecture) and
[BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md) (deploy runbook).*

## Summary

The research essays are effectively invisible to search engines and scholarly
indexes today, and the small amount of edition content that *is* in Google's
index consists of internal data-file URLs from a superseded build that now
return an empty page. The static mirror — live on staging at
`edition-staging.makingandknowing.org/mirror/` — was built to fix precisely
this: it gives every essay a real, crawlable HTML page with per-page titles,
descriptions, Google Scholar citation meta tags, and schema.org JSON-LD.
Deploying it to production, submitting its sitemap, redirecting the stale
indexed URLs, and repointing the essay DOIs are the recommended path.

## How the investigation was done

1. Inspected what production serves to a non-JS client (`curl`) for
   `robots.txt`, the sitemaps, and essay routes.
2. Followed an essay DOI (`doi.org/10.7916/0cp6-7h54`) as a crawler would.
3. Ran probe searches: the exact title of a published essay in quotes, and a
   `site:edition640.makingandknowing.org` query.
4. Checked whether the URLs found in the index still resolve.

## Findings

### 1. Production exposes no crawler infrastructure

`https://edition640.makingandknowing.org/robots.txt` returns the React app's
`index.html`, not a robots file — the CloudFront 403→index.html SPA fallback
swallows it. The same is true of `sitemap.txt` and `essays-sitemap.xml`. The
robots/sitemap work from issue #515 exists in the repo but has not shipped:
production still runs the June 2025 build (`prod062025-0`). **There is
currently no robots.txt and no discoverable sitemap on production.**

### 2. Every page is the same empty shell

Every URL on the production site — every essay, folio, and content page —
serves an identical document: `<title>Making and Knowing</title>`, no meta
description, no canonical link, and a body containing only
`<noscript>You need to enable JavaScript to run this app.</noscript>` and an
empty `<div id="app">`. Content exists only after client-side React renders
it. Googlebot *can* render JavaScript, but rendering is rationed and, even
when it happens, every page presents the same title and no snippet text — so
coverage is thin and results are of poor quality.

### 3. What Google has indexed is the wrong thing, and it is now dead

A `site:edition640.makingandknowing.org` search returns, alongside a couple
of JS-rendered routes, URLs like:

```
https://edition640.makingandknowing.org/bnf-ms-fr-640/production050724-0/annotations/ann_021_sp_15.html
```

These are the **raw essay HTML fragments inside the internal data tree of the
May 2024 build**. Starved of real HTML at the app's routes, Google crawled
into the data directory and indexed the fragments instead. Two problems:

- Those URLs are build-scoped. After a deploy, requests for an old build's
  fragments fall through the 403 fallback and serve the empty app shell —
  verified: the indexed URL above now returns the shell. **The essays' search
  results, such as they are, are dead links.**
- This will recur on every deploy: the current build's fragments (which do
  resolve today) will be indexed next, then break at the following deploy.

### 4. An exact-title search does not find the edition

Searching `"Wax and Tallow: Material Explorations"` (with the author's name)
surfaces the author's personal CV site — not the edition. An essay that
cannot rank for its own exact title is, for practical purposes, unindexed.

### 4a. Sample study: only ~20% of essays are findable by their own title

Exact-title searches for a 15-essay sample spanning every cohort (2014–2020)
found **3 of 15** essays (An Introduction to Ms. Fr. 640, Making and Using
Fish Glue, Lifecast Snakes Modeled in Black Wax). The other 12 lose their own
title searches to: authors' personal CV sites, the **retired 2015 prototype**
(makingandknowing-prototype.cul.columbia.edu), **draft student field notes**
(fieldnotes.makingandknowing.org), Amazon listings of unrelated historical
books, medical literature, and in one case Cambridge Audio "Azur 640" hi-fi
equipment.

Two patterns in the data:

- The three findable essays are indexed as JS-rendered SPA routes — Googlebot
  spends its limited rendering budget on the most externally-linked pages and
  never reaches the rest. Discoverability is prominence-dependent: the
  flagship introduction is findable; a typical essay is not.
- The project properties that outrank the edition (the retired prototype, the
  field-notes site) are **plain static HTML** — a natural experiment inside
  the project's own domain family demonstrating that its static sites get
  indexed while the SPA does not. The mirror gives the canonical edition the
  same property.

### 5. The DOI chain is broken for machines

`https://doi.org/10.7916/0cp6-7h54` resolves via 302 to
`http://edition640.makingandknowing.org/#/essays/ann_001_fa_14` — plain
`http`, and a legacy hash URL. Crawlers ignore everything after `#`, so to
any machine the DOI target is the empty homepage. The essays' manifest
`academicCommonsURL` fields are empty, so there is no Columbia Academic
Commons deposit carrying the scholarly-indexing weight in parallel. **The
essays' DOIs — the front door for Google Scholar and citation databases —
lead nowhere useful.**

## What the mirror already provides

The static mirror (`/mirror/`, live on staging; see
[README.md](README.md)) addresses the root cause — the absence of crawlable
HTML:

- One real HTML page per essay with a unique `<title>`, meta description
  (the abstract), visible bylines, DOI, and Cite As text; all 134 essays
  reachable by plain links from a themed index and listed in
  `/mirror/sitemap.xml`.
- **Google Scholar (Highwire) citation meta tags** on every essay page:
  `citation_title`, `citation_author` (one per author),
  `citation_publication_date` (the edition publication year, with the course
  year separated out), `citation_inbook_title`, `citation_publisher`,
  `citation_doi`, `citation_language`.
- **schema.org JSON-LD**: `ScholarlyArticle` per essay (authors, abstract,
  theme, DOI identifier, thumbnail), `Manuscript` per folio, and an
  edition-level `Book` + `WebSite` graph on the home page with the full
  editor list and edition DOI.
- Self-referential canonicals on every mirror page (the mirror is the
  crawlable artifact of record).
- Folio and content pages equally crawlable, so essays gain internal-link
  context (entry headings in transcriptions link to their related essays).

## Recommendations (in order of leverage)

1. **Deploy the mirror to production** (`lizard.js static production` against
   a production data build; see [BUILD_AND_DEPLOY.md](BUILD_AND_DEPLOY.md)).
   Everything below builds on this.
2. **Ship robots.txt and the sitemaps** (the #515 branch) with the next SPA
   deploy, so `robots.txt` stops returning the app shell and advertises
   `/mirror/sitemap.xml`.
3. **Set up Google Search Console** (and Bing Webmaster Tools) for the
   domain: submit `/mirror/sitemap.xml`, use URL Inspection to request
   indexing of a first batch of essay pages, and use the Coverage report as
   the ongoing measure of progress.
4. **Redirect the stale fragment URLs.** Extend the `mirror-index-rewrite`
   CloudFront function to 301 any
   `/bnf-ms-fr-640/<buildID>/annotations/ann_*.html` request to
   `/mirror/essays/ann_*/`. This rescues the dead results already in the
   index, transfers their accumulated signals to the mirror pages, and
   permanently ends the index-then-break cycle for essay fragments.
5. **Repoint the essay DOIs.** The `10.7916` prefix is Columbia's; ask
   Columbia Libraries to update the DataCite target URLs from
   `http://…/#/essays/ann_x` to `https://…/mirror/essays/ann_x/`. DOIs are
   how Scholar and citation databases reach content; this makes the front
   door open onto a real page.
6. **Link the mirror from the SPA** (e.g., a footer link) so crawlers
   discover it organically as well as via the sitemap.
7. **Request Google Scholar inclusion** once the citation tags are live on
   production — Scholar needs a browsable path to all essays (the mirror's
   essay index provides it). Expect weeks to months for coverage.
8. Later, lower priority: per-route canonical tags in the SPA pointing at
   the corresponding mirror pages (removes any duplicate-content ambiguity);
   Open Graph/Twitter card tags for link previews (deferred, tracked on
   issue #519); an `llms.txt` for AI crawlers if desired — though the
   current allow-all robots policy plus the mirror's clean HTML is already
   the substance of AI-tool accessibility.

## How to measure progress

Re-run after ~4–6 weeks on production:

- `site:edition640.makingandknowing.org` — should shift from stale fragment
  URLs to `/mirror/` pages, and grow toward the ~490-page inventory.
- Exact-title searches for several essays — the mirror pages should rank.
- Search Console Coverage — indexed count for the `/mirror/` prefix, plus
  the Performance report for queries that surface essays.
- Google Scholar searches for essay titles — the measure of the citation
  tags and DOI fixes.
- Validate markup anytime at `validator.schema.org` and Google's Rich
  Results Test by pasting mirror URLs.
