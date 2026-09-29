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

  // Apply theme data attribute to document body & root element
  const applyThemeToDom = useCallback((id: ThemeId) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', id);
      if (document.body) {
        document.body.setAttribute('data-theme', id);
      }
    }
  }, []);

  // Initial load from chrome storage or localStorage
  useEffect(() => {
    applyThemeToDom(themeId);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_THEME_KEY], (res) => {
        if (res && res[STORAGE_THEME_KEY] && res[STORAGE_THEME_KEY] in themesMap) {
          const loadedId = res[STORAGE_THEME_KEY] as ThemeId;
          setThemeIdState(loadedId);
          applyThemeToDom(loadedId);
        }
      });
    } else if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId | null;
        if (stored && stored in themesMap) {
          setThemeIdState(stored);
          applyThemeToDom(stored);
        }
      } catch {
        // Ignore localStorage error in sandboxed environment
      }
    }
  }, [applyThemeToDom, themesMap]);

  const setThemeId = useCallback((id: ThemeId) => {
    if (!(id in themesMap)) return;
    setThemeIdState(id);
    applyThemeToDom(id);

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

  const currentTheme = useMemo(() => getTheme(themeId), [themeId]);
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
