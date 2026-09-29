import { ThemeId, ThemePersonality } from './types';
import { undertaleTheme } from './undertale';
import { spongebobTheme } from './spongebob';

export * from './types';
export { undertaleTheme } from './undertale';
export { spongebobTheme } from './spongebob';

export const THEMES: Record<string, ThemePersonality> = {
  undertale: undertaleTheme,
  spongebob: spongebobTheme,
};

export const DEFAULT_THEME_ID: ThemeId = 'undertale';

export function getTheme(id: ThemeId | string | undefined | null): ThemePersonality {
  if (id && id in THEMES) {
    return THEMES[id];
  }
  return THEMES[DEFAULT_THEME_ID];
}

export function registerTheme(theme: ThemePersonality): void {
  THEMES[theme.id] = theme;
}

export function getAvailableThemes(): ThemePersonality[] {
  return Object.values(THEMES);
}
