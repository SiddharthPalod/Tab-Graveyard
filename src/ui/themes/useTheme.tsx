import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeId, ThemePersonality } from './types';
import { THEMES, DEFAULT_THEME_ID, getTheme, registerTheme as globalRegisterTheme } from './index';

const STORAGE_THEME_KEY = 'tabGraveyardTheme';

interface ThemeContextValue {
  theme:           ThemePersonality;
  themeId:         ThemeId;
  setThemeId:      (id: ThemeId) => void;
  toggleTheme:     () => void;
  availableThemes: ThemePersonality[];
  registerTheme:   (theme: ThemePersonality) => void;
}

const defaultContextValue: ThemeContextValue = {
  theme:           THEMES[DEFAULT_THEME_ID],
  themeId:         DEFAULT_THEME_ID,
  setThemeId:      () => {},
  toggleTheme:     () => {},
  availableThemes: Object.values(THEMES),
  registerTheme:   () => {},
};

const ThemeContext = createContext<ThemeContextValue>(defaultContextValue);

export const ThemeProvider: React.FC<{
  initialThemeId?: ThemeId;
  children:        React.ReactNode;
}> = ({ initialThemeId, children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(initialThemeId || DEFAULT_THEME_ID);
  const [themesMap, setThemesMap]  = useState<Record<string, ThemePersonality>>({ ...THEMES });

  // Pure dynamic DOM injection: sets CSS variables directly from theme.palette
  const applyThemeToDom = useCallback((themeToApply: ThemePersonality) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', themeToApply.id);
    if (document.body) {
      document.body.setAttribute('data-theme', themeToApply.id);
    }

    if (themeToApply.palette) {
      root.style.setProperty('--color-rpg-bg', themeToApply.palette.bg);
      root.style.setProperty('--color-rpg-white', themeToApply.palette.white);
      root.style.setProperty('--color-rpg-dark-gray', themeToApply.palette.darkGray);
      root.style.setProperty('--color-rpg-surface', themeToApply.palette.surface);
      root.style.setProperty('--color-rpg-surface-hover', themeToApply.palette.surfaceHover);
      root.style.setProperty('--color-rpg-border', themeToApply.palette.border);
      root.style.setProperty('--color-rpg-mid-gray', themeToApply.palette.midGray);
      root.style.setProperty('--color-rpg-light-gray', themeToApply.palette.lightGray);
      root.style.setProperty('--color-rpg-soul', themeToApply.palette.soul);
      root.style.setProperty('--color-rpg-determination', themeToApply.palette.determination);
      root.style.setProperty('--color-rpg-monster', themeToApply.palette.monster);
      root.style.setProperty('--color-rpg-magic', themeToApply.palette.magic);
      root.style.setProperty('--color-rpg-heart', themeToApply.palette.heart);
      root.style.setProperty('--color-rpg-yellow', themeToApply.palette.yellow);

      if (themeToApply.palette.shadow) {
        root.style.setProperty('--rpg-shadow', themeToApply.palette.shadow);
      }
      if (themeToApply.palette.shadowHover) {
        root.style.setProperty('--rpg-shadow-hover', themeToApply.palette.shadowHover);
      }
      if (themeToApply.palette.scrollbarTrack) {
        root.style.setProperty('--rpg-scrollbar-track', themeToApply.palette.scrollbarTrack);
      }
      if (themeToApply.palette.scrollbarThumb) {
        root.style.setProperty('--rpg-scrollbar-thumb', themeToApply.palette.scrollbarThumb);
      }
      if (themeToApply.palette.scrollbarThumbHover) {
        root.style.setProperty('--rpg-scrollbar-thumb-hover', themeToApply.palette.scrollbarThumbHover);
      }

      if (document.body) {
        document.body.style.backgroundColor = themeToApply.palette.bg;
        document.body.style.color = themeToApply.palette.white;
      }
    }
  }, []);

  // Initial load from chrome storage or localStorage
  useEffect(() => {
    const current = themesMap[themeId] || getTheme(themeId);
    applyThemeToDom(current);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_THEME_KEY], (res) => {
        if (res && res[STORAGE_THEME_KEY] && res[STORAGE_THEME_KEY] in themesMap) {
          const loadedId = res[STORAGE_THEME_KEY] as ThemeId;
          setThemeIdState(loadedId);
          applyThemeToDom(themesMap[loadedId]);
        }
      });
    } else if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId | null;
        if (stored && stored in themesMap) {
          setThemeIdState(stored);
          applyThemeToDom(themesMap[stored]);
        }
      } catch {
        // Ignore localStorage error in sandboxed environment
      }
    }
  }, [applyThemeToDom, themeId, themesMap]);

  const setThemeId = useCallback((id: ThemeId) => {
    if (!(id in themesMap)) return;
    setThemeIdState(id);
    applyThemeToDom(themesMap[id]);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_THEME_KEY]: id });
    } else if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_THEME_KEY, id);
      } catch {
        // Ignore
      }
    }
  }, [applyThemeToDom, themesMap]);

  const registerTheme = useCallback((newTheme: ThemePersonality) => {
    globalRegisterTheme(newTheme);
    setThemesMap((prev) => ({ ...prev, [newTheme.id]: newTheme }));
  }, []);

  const toggleTheme = useCallback(() => {
    const ids = Object.keys(themesMap);
    if (ids.length <= 1) return;
    const currentIndex = ids.indexOf(themeId);
    const nextIndex = (currentIndex + 1) % ids.length;
    setThemeId(ids[nextIndex]);
  }, [themeId, themesMap, setThemeId]);

  const currentTheme = useMemo(() => themesMap[themeId] || getTheme(themeId), [themeId, themesMap]);
  const availableThemes = useMemo(() => Object.values(themesMap), [themesMap]);

  const value = useMemo(
    () => ({
      theme: currentTheme,
      themeId,
      setThemeId,
      toggleTheme,
      availableThemes,
      registerTheme,
    }),
    [currentTheme, themeId, setThemeId, toggleTheme, availableThemes, registerTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  return useContext(ThemeContext) || defaultContextValue;
};
