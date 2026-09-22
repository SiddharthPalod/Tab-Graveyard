import { describe, it, expect } from 'vitest';
import { normalizeUrl, isTrackableUrl, getDomain } from '../core/urlUtils';

// ── normalizeUrl ──────────────────────────────────────────────────────────────
describe('normalizeUrl', () => {
  it('lowercases the URL', () => {
    expect(normalizeUrl('HTTPS://Example.COM/Path')).toBe('https://example.com/path');
  });

  it('strips tracking params (utm_source, fbclid, gclid, ref)', () => {
    const url = 'https://example.com/page?utm_source=google&utm_medium=cpc&ref=homepage&q=test';
    expect(normalizeUrl(url)).toBe('https://example.com/page?q=test');
  });

  it('strips URL fragment/hash', () => {
    expect(normalizeUrl('https://example.com/page#section-3')).toBe('https://example.com/page');
  });

  it('strips trailing slash on root domain', () => {
    expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
  });

  it('keeps trailing slash for non-root paths', () => {
    // https://example.com/about/ should keep slash (pathname != '/')
    expect(normalizeUrl('https://example.com/about/')).toBe('https://example.com/about/');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('');
  });

  it('handles invalid URLs gracefully', () => {
    const result = normalizeUrl('not-a-url');
    expect(result).toBe('not-a-url');
  });

  it('two URLs that differ only in UTM params are normalized to the same key', () => {
    const a = normalizeUrl('https://blog.com/post?utm_source=twitter');
    const b = normalizeUrl('https://blog.com/post?utm_source=email');
    expect(a).toBe(b);
  });
});

// ── isTrackableUrl ────────────────────────────────────────────────────────────
describe('isTrackableUrl', () => {
  it('returns true for regular https URLs', () => {
    expect(isTrackableUrl('https://github.com')).toBe(true);
  });

  it('returns true for http URLs', () => {
    expect(isTrackableUrl('http://localhost:3000')).toBe(true);
  });

  it('returns false for chrome:// URLs', () => {
    expect(isTrackableUrl('chrome://newtab')).toBe(false);
  });

  it('returns false for chrome-extension:// URLs', () => {
    expect(isTrackableUrl('chrome-extension://abc/popup.html')).toBe(false);
  });

  it('returns false for devtools:// URLs', () => {
    expect(isTrackableUrl('devtools://devtools/bundled/devtools_app.html')).toBe(false);
  });

  it('returns false for about:blank', () => {
    expect(isTrackableUrl('about:blank')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isTrackableUrl(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isTrackableUrl('')).toBe(false);
  });
});

// ── getDomain ─────────────────────────────────────────────────────────────────
describe('getDomain', () => {
  it('extracts hostname from https URL', () => {
    expect(getDomain('https://www.github.com/user/repo')).toBe('www.github.com');
  });

  it('returns empty string for invalid URL', () => {
    expect(getDomain('not-a-url')).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getDomain(undefined)).toBe('');
  });
});
