# JCR Content Packages — MSD Connect UK homepage (xwalk)

FileVault content packages that install the migrated homepage into an AEM as a
Cloud Service instance for Universal Editor authoring. Generated from the
crosswalk (xwalk) conversion of this project.

Two variants are provided — pick one:

| Package (built) | Source folder | Images | Use when |
|-----------------|---------------|--------|----------|
| `ema-msdconnect-uk-homepage-1.0.0.zip` | `jcr-package/` | External Edge Delivery media URLs (`*.aem.page/media_*`) | Images stay on the EDS delivery tier |
| `ema-msdconnect-uk-homepage-dam-1.0.0.zip` | `jcr-package-dam/` | DAM-managed assets under `/content/dam/msdconnect` (binaries included) | Images should be managed in the AEM DAM |

> **Note:** The `.zip` packages are **build artifacts and are not committed** to
> the repo. The FileVault **sources** (`jcr-package/`, `jcr-package-dam/`) are
> committed — build the installable `.zip` from them with the command in
> [Building the packages](#building-the-packages) below.

## What gets installed

Both packages create the homepage at **`/content/msdconnect/index`**
(site root `/content/msdconnect`), containing:

- **Cards Promo** block — 4 promotional card items (MSD in the UK, Healthcare
  Professional Resources, About us, Our Purpose)
- **Columns Feature** block — "Guided by Our Values" (text + image)

The DAM variant additionally creates `/content/dam/msdconnect` with three
`dam:Asset` nodes (hero and values images).

Filter roots:
- EDS-media package: `/content/msdconnect`
- DAM package: `/content/msdconnect` and `/content/dam/msdconnect`

## Prerequisite (important)

The page references `core/franklin/components/*` resource types and the
`/libs/core/franklin/templates/page` template. **Deploy the project code first**
(via the Cloud Manager pipeline for program `p8452`, env `e1321974`) so those
components exist on the instance. Installing the package before the code is
deployed will create the nodes but the page will not render/author correctly.

## Building the packages

The `.zip` files are not committed — build them from the source folders. A
FileVault package is just a zip of the folder contents (with `jcr_root/` and
`META-INF/` at the zip root):

```bash
# EDS-media variant
( cd jcr-package && zip -r -X ../ema-msdconnect-uk-homepage-1.0.0.zip jcr_root META-INF )

# DAM-managed variant
( cd jcr-package-dam && zip -r -X ../ema-msdconnect-uk-homepage-dam-1.0.0.zip jcr_root META-INF )
```

No `zip` binary? Use Python:

```bash
python3 - <<'PY'
import zipfile, os
for src, out in [('jcr-package','ema-msdconnect-uk-homepage-1.0.0.zip'),
                 ('jcr-package-dam','ema-msdconnect-uk-homepage-dam-1.0.0.zip')]:
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
        for root,_,files in os.walk(src):
            for f in files:
                full=os.path.join(root,f)
                z.write(full, os.path.relpath(full,src))
    print('built', out)
PY
```

## Install

1. Open Package Manager on the author instance:
   `https://author-p8452-e1321974.adobeaemcloud.com/crx/packmgr/index.jsp`
2. **Upload Package** → choose one of the `.zip` files above.
3. **Install**.
4. In **Sites** (`/content/msdconnect`), open the page → **Edit** to confirm the
   Universal Editor shows the `cards-promo` and `columns-feature` blocks.
5. **Publish** the page (and, for the DAM variant, its assets).

## Verify on publish

After publishing, the page should return HTTP 200:

```
https://publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://publish-p8452-e1321974.adobeaemcloud.com/content/msdconnect/index.html"
```

Via Edge Delivery (with `fstab.yaml` pointing at this author instance), preview
and publish the path, then check the `*.aem.page` / `*.aem.live` URLs.

## Regenerating the packages

The page JCR is produced from the published homepage markdown using
`@adobe/helix-md2jcr` with the project's `component-models.json` /
`component-definition.json` / `component-filters.json` (built via
`npm run build:json`). The packages are then zipped with the standard FileVault
layout (`META-INF/vault/` + `jcr_root/`). See `jcr-package/` and
`jcr-package-dam/` for the exact structure.

## Notes / caveats

- **Rendition processing**: the DAM package ships the `original` rendition plus
  basic metadata (MIME, width, height). AEM's asset workflow generates
  thumbnails/web renditions on install.
- **Not test-installed**: these packages were validated structurally (well-formed
  XML, correct FileVault layout) but not installed against a live instance.
