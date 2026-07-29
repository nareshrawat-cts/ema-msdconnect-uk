# AEMaaCS Full-Stack Setup — render `/content/msdconnect` on publish

Goal: render the migrated homepage at
`https://publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html`
via the AEM as a Cloud Service **publish tier** (server-side JCR rendering),
deployed by the **Cloud Manager full-stack pipeline** on `main`.

> **Why this is needed.** This repo is a *pure Edge Delivery* project (blocks,
> scripts, styles, component-models.json). Cloud Manager full-stack pipelines
> deploy **Maven artifacts** (OSGi bundles + FileVault content packages). A pure
> EDS repo has nothing for Maven to build, and the publish instance currently has
> **no** Franklin platform components (`/libs/core/franklin/components/*` → 404)
> and **no** content (`/content/msdconnect*` → 404). So a Maven AEM project must
> be added and deployed first.

> **Environment note.** This workspace has **no Maven/JDK**, so the project below
> must be generated and built where Maven 3.6+ and JDK 11/17 are available (a dev
> machine or the Cloud Manager build itself). Do **not** hand-write the module
> poms — generate them from Adobe's archetype so the build is guaranteed valid.

---

## Step 1 — Generate the Maven project from the Adobe archetype

Run on a machine with Maven + JDK. The AEM Project Archetype supports an
**Edge Delivery + Universal Editor (crosswalk)** flavor via `aemVersion=cloud`
and the EDS options:

```bash
mvn -B org.apache.maven.plugins:maven-archetype-plugin:3.2.1:generate \
  -D archetypeGroupId=com.adobe.aem \
  -D archetypeArtifactId=aem-project-archetype \
  -D archetypeVersion=54 \
  -D aemVersion=cloud \
  -D appTitle="MSD Connect UK" \
  -D appId="msdconnect" \
  -D groupId="uk.co.msdconnect" \
  -D artifactId="ema-msdconnect-uk" \
  -D package="uk.co.msdconnect" \
  -D frontendModule=none \
  -D includeExamples=n \
  -D includeDispatcherConfig=y \
  -D includeFrontendUniversalEditor=y
```

This produces the standard multi-module reactor:

```
pom.xml                (reactor)
all/                   (container package deployed by the pipeline)
core/                  (OSGi bundle — Java)
ui.apps/               (component apps, incl. Franklin/UE components)
ui.apps.structure/     (repository structure)
ui.config/             (OSGi configs)
ui.content/            (initial content, templates, config)
dispatcher/            (dispatcher config)
```

Merge the generated modules into this repo root (keep the existing EDS
`blocks/`, `scripts/`, `styles/`, `models/`, `component-*.json` — they continue
to serve Edge Delivery; the Maven modules add the AEMaaCS side).

## Step 2 — Add the Franklin/EDS components to `ui.apps`

The `cq:Page` we generated (`jcr-package/.../index/.content.xml`) references:
- `core/franklin/components/page/v1/page`
- `core/franklin/components/root/v1/root`
- `core/franklin/components/section/v1/section`
- `core/franklin/components/block/v1/block` (+ `/item`)
- `core/franklin/components/columns/v1/columns`
- `core/franklin/components/title|text|image/v1/*`

With `includeFrontendUniversalEditor=y`, the archetype wires the AEM UE / Franklin
delivery dependency that provides these under `/libs`. Confirm the deployed
instance resolves `/libs/core/franklin/components/page/v1/page.html` after deploy
(currently 404 = not yet deployed).

## Step 3 — Add the homepage content to `ui.content`

Place the page under the content package so it deploys with the pipeline:

```
ui.content/src/main/content/jcr_root/content/msdconnect/.content.xml
ui.content/src/main/content/jcr_root/content/msdconnect/index/.content.xml   (our cq:Page)
```

Reuse the JCR already generated in `jcr-package/jcr_root/content/msdconnect/`.
For DAM-managed images, also add `ui.content/.../jcr_root/content/dam/msdconnect/*`
from `jcr-package-dam/`. Add matching `<filter root=.../>` entries in the
package `filter.xml`.

## Step 4 — Cloud Manager full-stack pipeline

`main` is already connected to a pipeline. Ensure it is a **Full-Stack** pipeline
(builds Maven, deploys `all` to author + publish), not front-end only:

- Cloud Manager → Program `p8452` → Pipelines → the `main` pipeline → type must
  be **Full-Stack Code**, target env `e1321974`.
- Trigger it (push to `main` or Run). It runs `mvn clean install`, quality gates,
  then deploys.

## Step 5 — Publish the content

Content deployed by `ui.content` lands on author. Publish it to the publish tier:
- Author → Sites → `/content/msdconnect` → **Publish** (page + assets), or
- The pipeline can auto-activate `ui.content` depending on config.

## Step 6 — Verify

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html"
```
Expect `200` once code + content are deployed and the page is published.

---

## Important caveats

- **Two delivery models, don't conflate them.** `*.aem.live` (Edge Delivery, via
  Code Sync — already working) is separate from `publish-pXXXX...adobeaemcloud.com`
  (AEMaaCS publish, via Cloud Manager). This doc is about the latter.
- **Archetype is the source of truth for poms.** Generating guarantees correct
  dependency/plugin versions for `aemVersion=cloud`. Hand-authoring the reactor is
  error-prone and not done here on purpose.
- **Cannot be built/validated in this workspace** (no Maven/JDK). Run Steps 1–2 on
  a build machine; Cloud Manager performs the authoritative build on deploy.
