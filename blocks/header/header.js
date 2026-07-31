import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Source switches from inline desktop nav to the MENU toggle at 1280px.
const isDesktop = window.matchMedia('(min-width: 1280px)');

/**
 * Toggles the navigation panel open/closed (mobile / narrow only).
 * @param {Element} nav The nav element
 * @param {Boolean} forceClose When true, always closes
 */
function toggleMenu(nav, forceClose = false) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  const open = forceClose ? false : !expanded;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-menu-toggle');
  if (button) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    button.querySelector('.nav-menu-toggle-label').textContent = open ? 'Close' : 'Menu';
  }
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
}

function closeOnEscape(nav) {
  return (e) => {
    if (e.code === 'Escape' && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, true);
    }
  };
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Resolve the nav fragment: explicit metadata, then the published root path
  // (/nav on the backend), then the local dev path (/content/nav).
  const navMeta = getMetadata('nav');
  let fragment = null;
  if (navMeta) {
    fragment = await loadFragment(new URL(navMeta, window.location).pathname);
  }
  if (!fragment) fragment = await loadFragment('/nav');
  if (!fragment) fragment = await loadFragment('/content/nav');
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');

  // brand link cleanup
  const brandLink = navBrand?.querySelector('a');
  if (brandLink) {
    brandLink.className = '';
    const container = brandLink.closest('.button-container');
    if (container) container.className = '';
  }

  // The logo is a crisp PNG (text + transparency). EDS auto-decoration wraps it
  // in a <picture> that serves lossy WebP (format=webply), which blurs the mark.
  // Replace it with a plain lossless PNG <img> at ~2x the 210px display width.
  const brandPicture = navBrand?.querySelector('picture');
  if (brandPicture) {
    const orig = brandPicture.querySelector('img');
    const rawSrc = (orig?.getAttribute('src') || '').split('?')[0];
    if (rawSrc) {
      const logo = document.createElement('img');
      logo.src = `${rawSrc}?width=420&format=png&optimize=medium`;
      logo.alt = orig?.getAttribute('alt') || 'MSD Connect UK';
      logo.width = 210;
      logo.height = 37;
      logo.loading = 'eager';
      brandPicture.replaceWith(logo);
    }
  }

  // mark the active top-level link based on current path
  if (navSections) {
    const here = window.location.pathname.replace(/\/$/, '') || '/';
    navSections.querySelectorAll('a').forEach((a) => {
      const target = new URL(a.href, window.location).pathname.replace(/\/$/, '') || '/';
      if (target === here) a.parentElement.classList.add('active');
    });
  }

  // MENU toggle button (shown only below the desktop breakpoint)
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-menu-toggle';
  toggle.setAttribute('aria-controls', 'nav');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  toggle.innerHTML = '<span class="nav-menu-toggle-icon"></span><span class="nav-menu-toggle-label">Menu</span>';
  toggle.addEventListener('click', () => toggleMenu(nav));

  // Build the centered primary row: logo (left) + nav links + toggle (right).
  // The utility bar (nav-tools) stays a full-width band above this row.
  const primary = document.createElement('div');
  primary.className = 'nav-primary';
  if (navBrand) primary.append(navBrand);
  if (navSections) primary.append(navSections);
  primary.append(toggle);

  nav.textContent = '';
  if (navTools) nav.append(navTools);
  nav.append(primary);

  window.addEventListener('keydown', closeOnEscape(nav));
  // close the panel when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => toggleMenu(nav, true));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
