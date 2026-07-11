# Static Mirror — Build & Deploy

*Runbook for the static HTML mirror. For what the mirror is and how it works,
see [README.md](README.md); for how it was built and tested, see
[REPORT.md](REPORT.md). The SPA's own runbook is the repo-root
[BUILD_AND_DEPLOY.md](../../BUILD_AND_DEPLOY.md).*

## Build

```sh
node scripts/lizard.js static <target>       # local | staging | production
```

- Reads the already-generated data tree `public/bnf-ms-fr-640/<buildID>/`
  (run `lizard.js run <target>` + `migrate <target>` first) and
  `public/css/index.css` (run `yarn build-css` first).
- Writes ~490 pages to `static-build/` (config keys `staticDir` and
  `staticBasePath` in `edition_data/config.json`; basePath is `""` for local,
  `"/mirror"` for staging/production).
- Page inventory: home, all `content/*` pages, essays index + one page per
  essay, entries list, folio grid, one page per folio (facsimile +
  tc/tcn/tl embedded; crawlable without JS), glossary, search (client-side
  lunr over the existing `search-idx/` files), `sitemap.xml`.
- Pages reference the edition data at root-relative
  `/bnf-ms-fr-640/<buildID>/...` — the mirror does NOT duplicate the data
  tree. Facsimile tiles and folio thumbnails come from Gallica IIIF, as in
  the SPA. For the `local` target a `static-build/bnf-ms-fr-640` symlink into
  `public/` makes `python3 -m http.server 8642 --directory static-build`
  self-sufficient.
- Every run ends with an automatic check (page counts, unconverted custom
  tags, internal links, sitemap parity). ~15 reported broken links in
  `/essays/` are pre-existing typos in the essay source HTML (also broken in
  the SPA).

## Local preview

```sh
node scripts/lizard.js static local
python3 -m http.server 8642 --directory static-build
# open http://localhost:8642/
```

Facsimile images load live from Gallica, so an internet connection is needed
for those. The first search fetches ~30 MB of lunr indexes.

## Deploy

After the normal SPA deploy of `build/` (the mirror references that build's
data tree, so deploy them together):

```sh
aws s3 cp --profile mk-aws --recursive static-build/ s3://edition640-dist/<buildID>/mirror/
```

The mirror then appears at `https://<domain>/mirror/`. **One-time CloudFront
requirement:** directory URLs (`/mirror/folios/3r/`) need `index.html`
resolution — attach a viewer-request CloudFront Function to the distribution:

```js
function handler(event) {
    var request = event.request;
    if (request.uri.startsWith('/mirror/') && request.uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    return request;
}
```

(If a CloudFront Function is undesirable, switch the generator's URL helper to
emit extensionful URLs instead — see `urlFor()` in
`scripts/static_site/context.js`.)

`public/robots.txt` lists the mirror's sitemap
(`https://edition640.makingandknowing.org/mirror/sitemap.xml`); it ships with
the next SPA build.

## Scope notes

- Deep two-pane SPA URLs (`/folios/3r/f/12v/tl`) have no 1:1 static file; the
  mirror canonicalizes to one page per folio with pane state in the hash
  (`/mirror/folios/3r/#f/tl`). Links inside mirrored content are rewritten
  accordingly (glossary pane URLs go to `/mirror/glossary/`).
- XML pane view and book mode are not reproduced; each transcription links to
  its `original.txt` TEI source instead. In-folio search-term highlighting is
  reduced to highlighted search-result snippets.
