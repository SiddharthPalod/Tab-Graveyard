/**
 * src/core/urlUtils.ts  — Pure URL helpers. Fully testable. Zero dependencies.
 * JS devs own this file.
 */

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_ga',
];

const BLOCKED_SCHEMES = [
  'chrome://', 'chrome-extension://', 'devtools://', 'edge://', 'view-source:', 'about:',
];

/**
 * Returns a canonical URL for deduplication:
 *  - strips tracking params
 *  - strips fragment/hash
 *  - strips trailing slash on root
 *  - lowercased
 */
export function normalizeUrl(raw: string): string {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    TRACKING_PARAMS.forEach((p) => u.searchParams.delete(p));
    u.hash = '';
    let result = u.toString();
    if (u.pathname === '/' && result.endsWith('/')) result = result.slice(0, -1);
    return result.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

/**
 * Returns true only if the URL is a real trackable web page.
 * Filters out new-tab pages, chrome internals, devtools, etc.
 */
export function isTrackableUrl(raw: string | undefined): boolean {
  if (!raw) return false;
  const url = raw.trim().toLowerCase();
  if (!url) return false;
  return !BLOCKED_SCHEMES.some((s) => url.startsWith(s));
}

/** Extracts hostname from URL safely */
export function getDomain(raw: string | undefined): string {
  if (!raw) return '';
  try { return new URL(raw).hostname; }
  catch { return ''; }
}
