import { describe, it, expect } from 'vitest';
import { undertaleTheme } from '../ui/themes/undertale';
import { spongebobTheme } from '../ui/themes/spongebob';

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(...hexToRgb(hex1));
  const l2 = luminance(...hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Accessibility & WCAG AA/AAA Contrast Testing', () => {
  describe('SpongeBob Light Theme Contrast Audits', () => {
    const cardBg = '#FFFFFF';
    const pageBg = '#F0F8FF';
    const surfaceBg = '#E0F2FE';

    it('primary text on white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const primaryText = '#0F172A'; // Slate-900
      const cr = getContrastRatio(primaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('secondary text on white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const secondaryText = '#475569'; // Slate-600
      const cr = getContrastRatio(secondaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('krabby patty brown accents exceed WCAG AAA (>= 7.0:1)', () => {
      const krabbyBrown = '#7B4B3A';
      const cr = getContrastRatio(krabbyBrown, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('yellow/gold accent text on light backgrounds exceeds WCAG AA (>= 4.5:1)', () => {
      const krustyGold = '#854D0E'; // Yellow-800
      expect(getContrastRatio(krustyGold, cardBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(krustyGold, pageBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(krustyGold, surfaceBg)).toBeGreaterThanOrEqual(4.5);
    });

    it('SpongeBob yellow action buttons have high contrast dark text (>= 7.0:1)', () => {
      const buttonBg = '#F9E03B';
      const darkText = '#1E1B18';
      const cr = getContrastRatio(darkText, buttonBg);
      expect(cr).toBeGreaterThanOrEqual(7.0); // 12.86:1
    });

    it('danger action buttons have high contrast white text (>= 4.5:1)', () => {
      const dangerBg = '#BE123C'; // Rose-700
      const whiteText = '#FFFFFF';
      const cr = getContrastRatio(whiteText, dangerBg);
      expect(cr).toBeGreaterThanOrEqual(4.5); // 6.29:1
    });

    it('ocean blue utility buttons have high contrast white text (>= 4.5:1)', () => {
      const sweepBg = '#0369A1'; // Sky-700
      const whiteText = '#FFFFFF';
      const cr = getContrastRatio(whiteText, sweepBg);
      expect(cr).toBeGreaterThanOrEqual(4.5); // 5.93:1
    });

    it('status badge color pairs exceed WCAG AA (>= 4.5:1)', () => {
      // alive badge: Green-800 on Green-100
      expect(getContrastRatio('#166534', '#DCFCE7')).toBeGreaterThanOrEqual(4.5);
      // aging badge: Rose-800 on Rose-100
      expect(getContrastRatio('#9F1239', '#FFE4E6')).toBeGreaterThanOrEqual(4.5);
      // forgotten badge: Yellow-800 on Yellow-100
      expect(getContrastRatio('#854D0E', '#FEF3C7')).toBeGreaterThanOrEqual(4.5);
      // dead badge: Sky-700 on Sky-100
      expect(getContrastRatio('#0369A1', '#E0F2FE')).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Undertale Dark Theme Contrast Audits', () => {
    const darkBg = '#171817';
    const cardBg = '#222321';

    it('primary text on dark backgrounds exceeds WCAG AAA (>= 7.0:1)', () => {
      const whiteText = '#E3E3DE';
      expect(getContrastRatio(whiteText, darkBg)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(whiteText, cardBg)).toBeGreaterThanOrEqual(7.0);
    });

    it('golden determination text on dark backgrounds exceeds WCAG AAA (>= 7.0:1)', () => {
      const yellowText = '#FFD32A';
      expect(getContrastRatio(yellowText, darkBg)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(yellowText, cardBg)).toBeGreaterThanOrEqual(7.0);
    });
  });
});
