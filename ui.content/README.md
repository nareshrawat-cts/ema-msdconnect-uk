# ui.content — MSD Connect UK content package (pre-built skeleton)

FileVault content package that installs the migrated homepage and its images
onto AEM as a Cloud Service, so the page renders at
`publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html`.

**This module was authored ahead of the AEM Maven archetype** so the content is
ready to deploy. It must be reconciled with the generated reactor — see
`docs/aemaacs-fullstack-setup.md`.

## Contents

```
src/main/content/META-INF/vault/filter.xml      → /content/msdconnect, /content/dam/msdconnect
src/main/content/META-INF/vault/properties.xml  → package coords (content type)
src/main/content/jcr_root/content/msdconnect/.content.xml          site root (cq:Page)
src/main/content/jcr_root/content/msdconnect/index/.content.xml    homepage (Cards Promo + Columns Feature)
src/main/content/jcr_root/content/dam/msdconnect/*.jpg(+.dir)      3 dam:Asset images (DAM-managed)
```

Content is the **DAM-managed variant** (image references point to
`/content/dam/msdconnect/*`), sourced from `jcr-package-dam/` at the repo root.

## Reconcile after generating the archetype

1. Set this module's `<parent>` (groupId/artifactId/version) to match the
   generated reactor `pom.xml`. The skeleton assumes
   `uk.co.msdconnect : ema-msdconnect-uk : 1.0.0-SNAPSHOT`.
2. Add `ui.content` to the reactor `<modules>` (archetype usually includes it).
3. Ensure the **`all`** package embeds this artifact so the full-stack pipeline
   deploys it (embed entry in `all/pom.xml`).
4. Confirm `ui.apps` provides/depends on the Franklin components
   (`core/franklin/components/*`) the homepage references.

## Build (where Maven/JDK exist)

```bash
mvn -pl ui.content clean install     # builds the content-package zip
```

> Not buildable in the authoring workspace (no Maven/JDK). Cloud Manager performs
> the authoritative build on deploy.
