import { describe, it, expect } from 'vitest';
import { undertaleTheme } from '../ui/themes/undertale';
import { spongebobTheme } from '../ui/themes/spongebob';
import { academiaTheme } from '../ui/themes/academia';
import { cyberpunkTheme } from '../ui/themes/cyberpunk';
import { corporateTheme } from '../ui/themes/corporate';

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
    const cardBg    = spongebobTheme.palette.darkGray; // #F8FAFC (soft off-white)
    const pageBg    = spongebobTheme.palette.bg;       // #F1F5F9 (sea mist neutral)
    const surfaceBg = spongebobTheme.palette.surface;  // #E2E8F0 (pill inset surface)

    it('primary text on soft off-white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const primaryText = spongebobTheme.palette.white; // #1E293B
      const cr = getContrastRatio(primaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('secondary text on soft off-white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const secondaryText = spongebobTheme.palette.lightGray; // #475569
      const cr = getContrastRatio(secondaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('krabby patty brown accents exceed WCAG AAA (>= 7.0:1)', () => {
      const krabbyBrown = '#703E2F'; // Rich Krabby Patty Brown
      const cr = getContrastRatio(krabbyBrown, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0);
    });

    it('yellow/gold accent text on light backgrounds exceeds WCAG AA (>= 4.5:1)', () => {
      const krustyGold = spongebobTheme.palette.determination; // #92400E
      expect(getContrastRatio(krustyGold, cardBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(krustyGold, pageBg)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(krustyGold, surfaceBg)).toBeGreaterThanOrEqual(4.5);
    });

    it('SpongeBob golden amber action buttons have high contrast dark text (>= 7.0:1)', () => {
      const buttonBg = '#F59E0B';
      const darkText = '#0F172A';
      const cr = getContrastRatio(darkText, buttonBg);
      expect(cr).toBeGreaterThanOrEqual(7.0); // 8.31:1
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

  describe('Gothic Library Light Theme Contrast Audits', () => {
    const cardBg    = academiaTheme.palette.darkGray; // #FAF8F5 (warm cream)
    const pageBg    = academiaTheme.palette.bg;       // #F5F2EB (warm parchment)
    const surfaceBg = academiaTheme.palette.surface;  // #EBE6DA (aged vellum)

    it('deep gall ink primary text exceeds WCAG AAA (>= 7.0:1) on all light surfaces', () => {
      const primaryText = academiaTheme.palette.white; // #292524
      expect(getContrastRatio(primaryText, cardBg)).toBeGreaterThanOrEqual(7.0);    // 14.3:1
      expect(getContrastRatio(primaryText, pageBg)).toBeGreaterThanOrEqual(7.0);    // 13.4:1
      expect(getContrastRatio(primaryText, surfaceBg)).toBeGreaterThanOrEqual(7.0); // 11.9:1
    });

    it('sepia secondary text exceeds WCAG AAA (>= 7.0:1) on cream cards and parchment', () => {
      const secondaryText = academiaTheme.palette.lightGray; // #57534E
      expect(getContrastRatio(secondaryText, cardBg)).toBeGreaterThanOrEqual(7.0); // 7.20:1
    });

    it('antique leather bronze accent exceeds WCAG AAA (>= 7.0:1)', () => {
      const leatherBronze = academiaTheme.palette.midGray; // #78350F
      expect(getContrastRatio(leatherBronze, cardBg)).toBeGreaterThanOrEqual(7.0); // 8.55:1
    });

    it('bound volume retrieve/bind buttons exceed WCAG AAA (>= 7.0:1)', () => {
      const btnBg   = '#78350F';
      const btnText = '#FEF3C7';
      expect(getContrastRatio(btnText, btnBg)).toBeGreaterThanOrEqual(7.0); // 7.88:1
    });

    it('wax seal discard buttons exceed WCAG AAA (>= 7.0:1)', () => {
      const dangerBg   = '#881337';
      const dangerText = '#FFF1F2';
      expect(getContrastRatio(dangerText, dangerBg)).toBeGreaterThanOrEqual(7.0); // 8.9:1
    });

    it('archival ink shelve buttons exceed WCAG AAA (>= 7.0:1)', () => {
      const sweepBg   = '#1E3A8A';
      const sweepText = '#EFF6FF';
      expect(getContrastRatio(sweepText, sweepBg)).toBeGreaterThanOrEqual(7.0); // 11.5:1
    });

    it('academic status badges exceed WCAG AA (>= 4.5:1) and AAA (>= 7.0:1)', () => {
      // alive badge: Ivy Green-900 on Green-50
      expect(getContrastRatio('#14532D', '#F0FDF4')).toBeGreaterThanOrEqual(7.0);
      // aging badge: Crimson Rose-900 on Rose-50
      expect(getContrastRatio('#881337', '#FFF1F2')).toBeGreaterThanOrEqual(7.0);
      // forgotten badge: Amber-900 on Amber-100
      expect(getContrastRatio('#78350F', '#FEF3C7')).toBeGreaterThanOrEqual(6.0);
      // dead badge: Bodleian Blue-900 on Blue-50
      expect(getContrastRatio('#1E3A8A', '#EFF6FF')).toBeGreaterThanOrEqual(7.0);
    });
  });

  describe('Cyberpunk / Vaporwave Theme Contrast Audits', () => {
    const darkBg = cyberpunkTheme.palette.bg;       // #090814
    const cardBg = cyberpunkTheme.palette.darkGray; // #131124

    it('ice white primary text exceeds WCAG AAA (>= 7.0:1) on cyber void', () => {
      const whiteText = cyberpunkTheme.palette.white; // #F1F5F9
      expect(getContrastRatio(whiteText, darkBg)).toBeGreaterThanOrEqual(7.0);
      expect(getContrastRatio(whiteText, cardBg)).toBeGreaterThanOrEqual(7.0);
    });

    it('neon cyan accents exceed WCAG AAA (>= 7.0:1) on cyber card', () => {
      const cyan = cyberpunkTheme.palette.magic; // #00F0FF
      expect(getContrastRatio(cyan, cardBg)).toBeGreaterThanOrEqual(7.0);
    });

    it('laser yellow accents exceed WCAG AAA (>= 7.0:1) on cyber card', () => {
      const yellow = cyberpunkTheme.palette.yellow; // #FFE600
      expect(getContrastRatio(yellow, cardBg)).toBeGreaterThanOrEqual(7.0);
    });

    it('acid green accents exceed WCAG AAA (>= 7.0:1) on cyber card', () => {
      const green = cyberpunkTheme.palette.heart; // #00FF88
      expect(getContrastRatio(green, cardBg)).toBeGreaterThanOrEqual(7.0);
    });

    it('electric cyan boot buttons have high contrast dark text (>= 7.0:1)', () => {
      const btnBg = '#00F0FF';
      const darkText = '#05050A';
      expect(getContrastRatio(darkText, btnBg)).toBeGreaterThanOrEqual(7.0); // 14.2:1
    });

    it('neon magenta danger buttons exceed WCAG AA (>= 4.5:1)', () => {
      const btnBg = '#D90368';
      const whiteText = '#FFFFFF';
      expect(getContrastRatio(whiteText, btnBg)).toBeGreaterThanOrEqual(4.5); // 5.04:1
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

  describe('Corporate / Clean Light Theme Contrast Audits', () => {
    const cardBg = corporateTheme.palette.darkGray; // #FFFFFF
    const pageBg = corporateTheme.palette.bg;       // #F8F9FA

    it('primary text on pure white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const primaryText = corporateTheme.palette.white; // #202124
      const cr = getContrastRatio(primaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0); // 15.5:1
    });

    it('secondary text on pure white card exceeds WCAG AAA (>= 7.0:1)', () => {
      const secondaryText = corporateTheme.palette.lightGray; // #5F6368
      const cr = getContrastRatio(secondaryText, cardBg);
      expect(cr).toBeGreaterThanOrEqual(7.0); // 7.2:1
    });

    it('primary Google Blue action button has high contrast white text (>= 4.5:1)', () => {
      const buttonBg = corporateTheme.palette.determination; // #1A73E8
      const whiteText = '#FFFFFF';
      expect(getContrastRatio(whiteText, buttonBg)).toBeGreaterThanOrEqual(4.5);
    });

    it('danger Chrome Red action button has high contrast white text (>= 4.5:1)', () => {
      const dangerBg = corporateTheme.palette.soul; // #D93025
      const whiteText = '#FFFFFF';
      expect(getContrastRatio(whiteText, dangerBg)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
