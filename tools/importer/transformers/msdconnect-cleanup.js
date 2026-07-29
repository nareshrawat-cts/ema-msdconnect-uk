/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: MSD Connect UK site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only the
 * page-level authorable content inside <section id="mhh_mcn_content">.
 *
 * All selectors below were verified against migration-work/cleaned.html:
 *   - #mconnect-theme-banner-container : empty banner container (body > div.banner-container)
 *   - header.site-header               : site header / primary + top nav
 *   - #onetrust-consent-sdk            : OneTrust cookie consent dialog
 *   - #ot-sdk-btn-floating             : OneTrust floating cookie button
 *   - .site-footer-job-number          : footer job-number strip (body > div)
 *   - #site-footer                     : site footer (nav, logos, copyright, AE box)
 *   - link                             : leftover stylesheet <link> tags
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent dialog + floating button block parsing / overlay the page.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#ot-sdk-btn-floating',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome (banner shell, header, footer) and leftover elements.
    WebImporter.DOMUtils.remove(element, [
      '#mconnect-theme-banner-container',
      'header.site-header',
      '.site-footer-job-number',
      '#site-footer',
      'link',
    ]);
  }
}
