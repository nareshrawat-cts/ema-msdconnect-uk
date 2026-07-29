import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  let fragment = await loadFragment(footerPath);
  if (!fragment) {
    fragment = await loadFragment('/content/footer');
  }

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // label the sections: nav links, brand logos, legal (incl. adverse-event reporting)
  const sections = ['footer-nav', 'footer-logos', 'footer-legal'];
  [...footer.children].forEach((section, i) => {
    if (sections[i]) section.classList.add(sections[i]);
  });

  // the last paragraph of the legal section is the adverse-event reporting box
  // (the jump target for the header's utility-bar AE link)
  const legal = footer.querySelector('.footer-legal');
  const aeBox = legal?.querySelector('p:last-child');
  if (aeBox) {
    aeBox.classList.add('footer-ae-reporting');
    aeBox.id = 'ae-reporting-box';
  }

  // wire the Cookie Preferences link to the OneTrust dialog if present
  const cookieLink = footer.querySelector('a[href="#cookie-preferences"]');
  if (cookieLink) {
    cookieLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === 'function') {
        window.OneTrust.ToggleInfoDisplay();
      }
    });
  }

  block.append(footer);
}
