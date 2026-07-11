# DCE Build & Deploy Runbook

Practical, tested procedure for building and deploying a new version of the **Digital Critical Edition** (edition640 — _Secrets of Craft and Nature_, BnF Ms. Fr. 640).

> This reflects the process as actually run and verified July 2026. Where it differs from `README.md`, this document is correct — see [Gotchas](#gotchas) for the discrepancies.

## Overview

The **website** is built from **this repo** (`making-knowing-edition`) via the custom build tool `scripts/lizard.js`. A "new version" is a new **Build ID** of the form `<env>MMDDYY-N` (e.g. `staging070926-0`, `production070926-0`), configured in `edition_data/config.json`.

The build consumes three data repos, cloned under `edition_data/`:

| Repo | Provides |
|---|---|
| `m-k-manuscript-data` | Source XML (`ms-xml`), folios, entries, metadata |
| `m-k-annotation-data` | Research essays (annotations) — the GitHub source of truth (`html/`, all `data_source=gh`) |
| `edition-webpages` | Static site content (bibliography, about, menu, figures) |

A build produces a self-contained static bundle in `./build/` that is deployed to **S3 (`edition640-dist`) + CloudFront**. The edition data is bundled inside the build under `build/bnf-ms-fr-640/<buildID>/`, so the app fetches it same-origin in production.

**Data URLs are baked in absolutely at build time** from the target's `editionDataURL`. A build made for `staging`/`production` cannot be previewed at `localhost` (browser CORS) — for local preview you must build with the `local` target. See [Local preview](#local-preview).

## Prerequisites (one-time)

- [ ] **Node 14.21.3 via nvm** (`nvm install 14.21.3`). The site needs it for node-sass; do **not** use Node 18/20 — see [Gotchas](#gotchas).
- [ ] **Yarn 1.22.x**, **pandoc 2.14+**, and deps installed: `yarn install && yarn --cwd scripts install` (run under Node 14).
- [ ] **AWS CLI** configured with the **`mk-aws`** profile (Making & Knowing account `213687847143`). ⚠️ The `default` profile is the Mark Twain Project account and will `AccessDenied` on `edition640-dist`.
- [ ] rclone / Google Drive is **no longer needed** — all essays are `data_source=gh`. Skip `lizard.js sync`.

Pin the Node version for the whole session:
```sh
source ~/.nvm/nvm.sh && nvm use 14.21.3
```

## Build checklist

- [ ] **1. Choose/bump the Build ID.** In `edition_data/config.json`, set `buildID` (`<env>MMDDYY-N`) and `workingDir` (`edition_data/working/MMDDYY-N`) for the target env. Bump `N` for a second build the same day. For a deploy, use a Build ID that does **not** already exist in the S3 bucket.
- [ ] **2. Pull latest data** into all three repos:
  ```sh
  cd edition_data
  for r in m-k-manuscript-data m-k-annotation-data edition-webpages; do git -C "$r" pull --ff-only; done
  cd ..
  ```
- [ ] **3. Seed thumbnails** (only if this is a fresh `workingDir`). The `run` step reads `working/<id>/thumbnails/thumbnails.json`, which was historically produced by the retired Drive step. Copy it from the previous build:
  ```sh
  mkdir -p edition_data/working/<NEW-id>/thumbnails
  cp edition_data/working/<PREV-id>/thumbnails/* edition_data/working/<NEW-id>/thumbnails/
  ```
- [ ] **4. Generate the edition data** for the target env (`staging` / `production` / `local`):
  ```sh
  node scripts/lizard.js run <env>
  node scripts/lizard.js migrate <env>
  ```
  `run` regenerates manifest, folios, entries, search index, glossary, static content, essays, `.env`. `migrate` copies the gh essay HTML into the build. (Skip `sync` — it needs Drive.)
- [ ] **5. Build the bundle** (Node 14 rejects the hardcoded `--openssl-legacy-provider`, so strip it):
  ```sh
  ./node_modules/.bin/node-sass ./src/scss/ -o ./public/css/
  env -u NODE_OPTIONS ./node_modules/.bin/react-scripts build
  ```
  Produces `./build/`. Look for `Compiled successfully` / "build folder is ready".
- [ ] **6. Prune** `build/bnf-ms-fr-640/` to just the current Build ID (yarn copies *all* historical build-id dirs from `public/`, ~1.6 GB → ~300 MB):
  ```sh
  cd build/bnf-ms-fr-640 && ls | grep -v '^<buildID>$' | xargs rm -rf; cd ../..
  ```
- [ ] **7. Verify** `build/index.html` exists, the Build ID + `editionDataURL` are baked into `build/static/js/*.js`, and `build/bnf-ms-fr-640/<buildID>/manifest.json` carries the expected (staging/production) URLs.

## Local preview

To eyeball a build in a browser **before** deploying, build with the `local` target so URLs are same-origin `localhost`:

- [ ] `node scripts/lizard.js run local && node scripts/lizard.js migrate local`
- [ ] `env -u NODE_OPTIONS BROWSER=none ./node_modules/.bin/react-scripts start` (serves on `:4000`)
- [ ] Open http://localhost:4000 (BrowserRouter — routes like `/folios/8v`, `/content/resources/bibliography`).
- [ ] Note: manuscript facsimiles come from Gallica (needs internet + a real browser UA); essay thumbnails come from the S3 asset server.

⚠️ Running `run local` repoints the data to `localhost`; re-run `run <env>` before building a deployable bundle.

## Deploy checklist (S3 + CloudFront)

All steps under `export AWS_PROFILE=mk-aws`.

| Target | CloudFront Distribution | Domain |
|---|---|---|
| staging | `E3N5MGPR886QW3` | edition-staging.makingandknowing.org |
| production | `E19BMI4MVNQWLO` | edition640.makingandknowing.org |
| dev | `E22EE1IRF200H3` | edition-dev.makingandknowing.org |

- [ ] **1. (Rarely) upload new essay images.** Only if `edition_data/s3-images/` is non-empty (new Drive-migrated essays — usually empty, all gh): `aws s3 cp ./edition_data/s3-images/ s3://mk-annotation-images --recursive --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers`, then clear the dir.
- [ ] **2. Upload the build** (non-live — just stages a new key):
  ```sh
  cd build
  aws s3 cp . s3://edition640-dist/<buildID> --recursive \
    --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
  cd ..
  ```
- [ ] **3. Go live — repoint the distribution's OriginPath** to `/<buildID>`:
  ```sh
  aws cloudfront get-distribution-config --id <DIST> > cf.json   # note the ETag
  # edit DistributionConfig.Origins.Items[0].OriginPath -> "/<buildID>"
  aws cloudfront update-distribution --id <DIST> \
    --distribution-config file://<edited DistributionConfig> --if-match <ETag>
  ```
- [ ] **4. Invalidate** the cached app shell:
  ```sh
  aws cloudfront create-invalidation --distribution-id <DIST> --paths "/*"
  ```
- [ ] **5. Wait & verify.** Poll until distribution `Status=Deployed` and invalidation `Status=Completed` (a few min), then:
  ```sh
  curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/index.html
  curl -s https://<domain>/bnf-ms-fr-640/<buildID>/manifest.json | head
  ```

### Rollback
Flip the OriginPath back to the previous Build ID (prior builds remain in the bucket) and invalidate `/*`. As of 2026-07-09: staging prior = `/staging071625-0`, production = `/production071625-0`.

## Static HTML mirror

A fully static, no-React mirror of the edition can be generated from the same
edition data (`node scripts/lizard.js static <target>`) and published alongside
the SPA under `/mirror/`. Documentation lives in **[docs/static/](docs/static/README.md)** —
see [docs/static/BUILD_AND_DEPLOY.md](docs/static/BUILD_AND_DEPLOY.md) for the
build/deploy runbook.

## Gotchas

- **Node version.** README says Node 14, but `package.json`'s `build`/`start` scripts hardcode `NODE_OPTIONS=--openssl-legacy-provider`, which only exists on Node 17+ and is **rejected** on Node 14. Build/serve by invoking `react-scripts` directly with `env -u NODE_OPTIONS` (as above). node-sass 6 needs Node ≤16, so Node 14 is the sweet spot.
- **Google Drive is retired.** All 134 essays are `data_source=gh`. `lizard.js sync`/`download`/`download-thumbs` (and rclone) are obsolete; `run` + `migrate` build entirely from the GitHub repos.
- **`thumbnails.json`.** `run` fails with `ENOENT .../thumbnails/thumbnails.json` for a fresh working dir, because that file was produced by the retired Drive step. Copy it from the previous build (checklist step 3).
- **Local vs staging/production URLs.** Data URLs are absolute and baked in at `run` time. `lizard.js env <target>` only rewrites `.env`, **not** the generated `manifest.json`/`list/*.json` — you must re-run `run <target>` to change them.
- **AWS account.** Deploy uses the **`mk-aws`** profile; the `default` profile (Mark Twain Project) is a different account and lacks access to `edition640-dist` and the edition CloudFront distributions.
- **Bibliography URL rendering (issue #214, open).** `scripts/static_content.js` converts pages with `pandoc -f gfm`, whose `autolink_bare_uris` extension double-wraps any URL used as visible link text into invalid nested `<a><a>` anchors — and if that's worked around, the `emoji` extension turns `:de:` in URNs into a flag. Converting the markdown to `<a>` tags does **not** fix it. The one-line fix is `pandoc -f gfm` → `pandoc -f gfm-autolink_bare_uris-emoji` in `static_content.js` (disables both misbehaving extensions; side effect: bare unlinked URLs stop auto-linking and `:shortcode:` emoji stop rendering).
