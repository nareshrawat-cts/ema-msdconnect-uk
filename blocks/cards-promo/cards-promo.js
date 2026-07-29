import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture')) div.className = 'cards-promo-card-image';
      else div.className = 'cards-promo-card-body';
    });
    // photo variant = has an image with a picture; otherwise solid teal panel variant
    if (li.querySelector('.cards-promo-card-image picture')) {
      li.classList.add('cards-promo-photo');
      // a photo heading may carry a supporting sentence after a <br>; mark it so
      // it can render at a smaller size, matching the source design.
      const heading = li.querySelector('.cards-promo-card-body h1, .cards-promo-card-body h2, .cards-promo-card-body h3');
      const br = heading?.querySelector('br');
      if (br) {
        const support = document.createElement('span');
        support.className = 'cards-promo-support';
        let node = br.nextSibling;
        while (node) {
          const next = node.nextSibling;
          support.append(node);
          node = next;
        }
        br.replaceWith(support);
      }
    } else {
      li.classList.add('cards-promo-panel');
      // drop the empty image cell so the body fills the tile
      const emptyImg = li.querySelector('.cards-promo-card-image');
      if (emptyImg && !emptyImg.querySelector('picture')) emptyImg.remove();
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
