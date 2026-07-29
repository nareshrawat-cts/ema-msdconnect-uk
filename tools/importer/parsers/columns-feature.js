/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature.
 * Base block: columns
 * Source: https://www.msdconnect.co.uk/
 * Instance selector: .mhh-mcn-columns--vertical-alignment-center
 *
 * Maps the "Guided by Our Values" values row: a two-column layout where the
 * left column holds a heading + paragraph and the right column holds a single
 * image (wrapped in a <figure>).
 *
 * Columns table format (flexible):
 *   Row 1: block name
 *   Row 2: one cell per column -> [ text-content, image ]
 */
export default function parse(element, { document }) {
  // Direct child columns of the inner wrapper (fall back to any descendant columns).
  const inner = element.querySelector('.mhh-mcn-columns-inner') || element;
  let columns = Array.from(inner.querySelectorAll(':scope > .mhh-mcn-v1-column, :scope > .mhh-mcn-column'));

  // Fallback: if the expected column wrappers aren't found, treat the direct
  // children of the inner wrapper as columns.
  if (columns.length === 0) {
    columns = Array.from(inner.children);
  }

  // Empty-block guard.
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build one cell per column. Each cell holds all of that column's content
  // (heading + paragraph for the text column; the image for the media column).
  const row = columns.map((col) => {
    // Prefer the image itself (unwrapped from <figure>) so the block renders a
    // clean image; otherwise pass the column's meaningful children.
    const img = col.querySelector('img');
    if (img && !col.querySelector('h1, h2, h3, h4, h5, h6, p')) {
      return img;
    }
    const parts = Array.from(col.childNodes).filter((n) => {
      if (n.nodeType === 3) return n.textContent.trim().length > 0; // text node
      return n.nodeType === 1; // element node
    });
    return parts.length ? parts : col;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
