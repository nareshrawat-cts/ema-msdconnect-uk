/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/cards-promo.js
  function buildCardRow(element, document) {
    let image = element.querySelector("img");
    if (!image) {
      let bg = element.style && element.style.backgroundImage;
      if ((!bg || bg === "none") && typeof getComputedStyle === "function") {
        try {
          bg = getComputedStyle(element).backgroundImage;
        } catch (e) {
          bg = "";
        }
      }
      const match = bg && bg.match(/url\((['"]?)(.*?)\1\)/);
      if (match && match[2] && match[2] !== "none") {
        const img = document.createElement("img");
        img.src = match[2];
        const alt = element.querySelector("h1, h2, h3");
        if (alt) img.alt = alt.textContent.trim();
        image = img;
      }
    }
    const content = element.querySelector(".mhh-mcn-v1-hero-content") || element;
    const heading = content.querySelector('h1, h2, h3, .mhh-mcn-v1-hero__title, [class*="heading"]');
    const description = content.querySelector('p, .mhh-mcn-v1-hero__content, [class*="paragraph"]');
    const ctaAnchors = Array.from(
      content.querySelectorAll(".mhh-mcn-v1-links a, a.mhh-mcn-v1-link")
    );
    if (!image && !heading && !description && ctaAnchors.length === 0) return null;
    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaAnchors.forEach((a) => {
      const label = a.querySelector(".mhh-mcn-v1-link__label");
      if (label && label.textContent.trim()) {
        a.textContent = label.textContent.trim();
      }
      textCell.push(a);
    });
    return [image || "", textCell.length ? textCell : ""];
  }
  function parse(element, { document }) {
    const tiles = Array.from(document.querySelectorAll(".mhh-mcn-v1-hero"));
    if (tiles.length === 0 || tiles[0] !== element) {
      element.remove();
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const row = buildCardRow(tile, document);
      if (row) cells.push(row);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
    tiles.slice(1).forEach((tile) => tile.remove());
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    const inner = element.querySelector(".mhh-mcn-columns-inner") || element;
    let columns = Array.from(inner.querySelectorAll(":scope > .mhh-mcn-v1-column, :scope > .mhh-mcn-column"));
    if (columns.length === 0) {
      columns = Array.from(inner.children);
    }
    if (columns.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = columns.map((col) => {
      const img = col.querySelector("img");
      if (img && !col.querySelector("h1, h2, h3, h4, h5, h6, p")) {
        return img;
      }
      const parts = Array.from(col.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0;
        return n.nodeType === 1;
      });
      return parts.length ? parts : col;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/msdconnect-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#ot-sdk-btn-floating"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#mconnect-theme-banner-container",
        "header.site-header",
        ".site-footer-job-number",
        "#site-footer",
        "link"
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "MSD Connect UK homepage - hero banner, HCP resources CTA, about us / our purpose columns, values section with figure, and footer.",
    urls: ["https://www.msdconnect.co.uk/"],
    blocks: [
      {
        name: "cards-promo",
        instances: [".mhh-mcn-v1-hero"]
      },
      {
        name: "columns-feature",
        instances: [".mhh-mcn-columns--vertical-alignment-center"]
      }
    ],
    sections: [
      {
        id: "rc3",
        name: "main-content",
        selector: "#mhh_mcn_content",
        style: null,
        blocks: ["cards-promo", "columns-feature"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "cards-promo": parse,
    "columns-feature": parse2
  };
  var transformers = [
    transform
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const pathname = new URL(params.originalURL).pathname.replace(/\.html$/, "").replace(/\/$/, "");
      const path = WebImporter.FileUtils.sanitizePath(pathname || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
