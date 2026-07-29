# Cloud Manager — Front-End Pipeline Configuration

Configuration spec for a **Front-End (Edge Delivery) deployment pipeline** in
Adobe Cloud Manager for this project.

> **Read this first.** Cloud Manager pipelines are configured in the **Cloud
> Manager UI / API**, not by a file committed to this repo (unlike GitHub
> Actions / `.github/workflows`). There is no `pipeline.yaml` that AEM reads.
> This document is the **spec of what to enter** in Cloud Manager, plus the
> repo-side prerequisites the pipeline needs.
>
> Note also: this project already deploys code to Edge Delivery via **Code Sync**
> (the `*.aem.page` / `*.aem.live` URLs). A Cloud Manager front-end pipeline is a
> **separate, optional** delivery path used when serving via an AEMaaCS program
> (e.g. Universal Editor authoring against `author-p8452-e1321974`). Use it only
> if you are delivering through the AEMaaCS program rather than Code Sync.

## Program / environment

| Setting | Value |
|---------|-------|
| Program | `p8452` |
| Environment (author) | `e1321974` |
| Git org / repo | `nareshrawat-cts / ema-msdconnect-uk` |
| Deploy branch | `main` |

## Pipeline settings (enter in Cloud Manager UI)

Cloud Manager → Program `p8452` → **Pipelines** → **Add** → **Deployment Pipeline**
→ type **Front-End Code**.

| Field | Value |
|-------|-------|
| Pipeline name | `msdconnect-frontend-main` |
| Source | GitHub repo `nareshrawat-cts/ema-msdconnect-uk` |
| Branch | `main` |
| Code location / root | repository root (`/`) |
| Trigger | On Git change to `main` (or Manual) |
| Target environment | `e1321974` |

## Repo-side build prerequisites

A front-end pipeline runs `npm ci` then `npm run build` at the repo root and
deploys the produced static output. This repo currently has **no `build`
script** (Edge Delivery serves `blocks/`, `scripts/`, `styles/` as-is), so add a
build that produces the generated UE JSON and leaves the static files in place.

Add to `package.json` `scripts` if using a CM front-end pipeline:

```json
"build": "npm run build:json"
```

- `build:json` compiles `component-models.json`, `component-definition.json`,
  and `component-filters.json` from `models/` (already present).
- No bundler/transpile step is needed — EDS ships vanilla JS/CSS.
- If the pipeline expects a specific output directory, set the front-end
  **output/dist** to the repo root (static assets are served directly).

## Full-Stack vs Front-End

- **Front-End pipeline** — for Edge Delivery code (this project). No Maven.
- **Full-Stack pipeline** — only if you also ship `ui.apps` / `ui.frontend`
  Maven modules (OSGi bundles, JCR content packages via `filevault-package-maven-plugin`).
  This repo has **no Maven project**, so a full-stack pipeline is **not**
  applicable unless you add one.

## Related prerequisites (outside this pipeline)

1. **Repo connected** to the Cloud Manager program, and the
   `.well-known/adobe/cloud-manager-challenge` domain-ownership file validated
   (already committed on `main`).
2. **Franklin/EDS component packages** installed on the environment so the
   `core/franklin/components/*` resource types exist (required before the JCR
   content packages in `JCR-PACKAGES.md` will render/author).
3. **`fstab.yaml`** points at the author instance
   (`author-p8452-e1321974.adobeaemcloud.com/bin/franklin.delivery/nareshrawat-cts/ema-msdconnect-uk/main`)
   — already set.

## Run & verify

1. Trigger the pipeline (Git push to `main`, or **Run** in Cloud Manager).
2. Confirm the deploy completes (green) in Cloud Manager → Pipelines.
3. Author a page in Universal Editor, publish it, and verify on publish:
   `https://publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html`

## API alternative (optional)

Pipelines can also be created via the Cloud Manager API
(`POST /api/program/{programId}/pipelines`) with an IMS service-account token.
That is an Adobe-credentialed operation performed outside this repo; the values
above map to the API request body fields (`name`, `type: FRONTEND`,
`repositoryId`, `branch`, `environmentId`).
