/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo.
 * Base block: cards
 * Source: https://www.msdconnect.co.uk/
 * Instance selector: .mhh-mcn-v1-hero
 *
 * The four .mhh-mcn-v1-hero tiles form a SINGLE promotional grid, so they are
 * emitted as ONE cards-promo block with four card rows (not four separate
 * single-card blocks). This lets the block render as a 2x2 grid on desktop.
 *
 * Each card is a 2-column row:
 *   cell 1: image (photo tiles). Text-only teal panels have no image → '' .
 *   cell 2: title heading (may be a link) + optional description + optional CTA.
 *
 * Two tile variants are handled:
 *   - Photo hero: <img> (or CSS background-image) + linked heading.
 *   - Solid teal panel: heading + paragraph + CTA button link, no image.
 */
function buildCardRow(element, document) {
  // Photo tiles carry their image as a real <img> or a CSS background-image.
  let image = element.querySelector('img');
  if (!image) {
    let bg = element.style && element.style.backgroundImage;
    if ((!bg || bg === 'none') && typeof getComputedStyle === 'function') {
      try {
        bg = getComputedStyle(element).backgroundImage;
      } catch (e) {
        bg = '';
      }
    }
    const match = bg && bg.match(/url\((['"]?)(.*?)\1\)/);
    if (match && match[2] && match[2] !== 'none') {
      const img = document.createElement('img');
      img.src = match[2];
      const alt = element.querySelector('h1, h2, h3');
      if (alt) img.alt = alt.textContent.trim();
      image = img;
    }
  }

  const content = element.querySelector('.mhh-mcn-v1-hero-content') || element;
  const heading = content.querySelector('h1, h2, h3, .mhh-mcn-v1-hero__title, [class*="heading"]');
  const description = content.querySelector('p, .mhh-mcn-v1-hero__content, [class*="paragraph"]');
  const ctaAnchors = Array.from(
    content.querySelectorAll('.mhh-mcn-v1-links a, a.mhh-mcn-v1-link'),
  );

  // Nothing meaningful → no row.
  if (!image && !heading && !description && ctaAnchors.length === 0) return null;

  const textCell = [];
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  ctaAnchors.forEach((a) => {
    const label = a.querySelector('.mhh-mcn-v1-link__label');
    if (label && label.textContent.trim()) {
      a.textContent = label.textContent.trim();
    }
    textCell.push(a);
  });

  return [image || '', textCell.length ? textCell : ''];
}

export default function parse(element, { document }) {
  const tiles = Array.from(document.querySelectorAll('.mhh-mcn-v1-hero'));

  // Only the first tile builds the combined block; the rest are folded in here
  // and removed, so the import loop skips them (their parentNode becomes null).
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);

  // Remove the remaining source tiles so they are not parsed again.
  tiles.slice(1).forEach((tile) => tile.remove());
}
