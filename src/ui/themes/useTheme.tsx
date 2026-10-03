import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeId, ThemePersonality } from './types';
import { THEMES, DEFAULT_THEME_ID, getTheme, registerTheme as globalRegisterTheme } from './index';
import { db } from '../../core/db';

const STORAGE_THEME_KEY = 'tabGraveyardTheme';

// Synchronous initial fallback check to prevent flash of wrong theme on startup
function getInitialThemeId(initialThemeId?: ThemeId): ThemeId {
  if (initialThemeId && initialThemeId in THEMES) {
    return initialThemeId;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_THEME_KEY);
      if (stored && stored in THEMES) {
        return stored as ThemeId;
      }
    } catch {
      // Ignore storage access error in restricted sandbox
    }
  }
  return DEFAULT_THEME_ID;
}

/**
 * Multi-tier bulletproof theme persistence:
 * 1. Synchronous localStorage (instant frame-0 load)
 * 2. chrome.storage.sync (survives rebuilds, extension updates, and Google account sync)
 * 3. chrome.storage.local (fast local disk cache)
 * 4. IndexedDB via Dexie (persists identically to tabs/tombstones across releases)
 */
export async function persistThemePreference(id: ThemeId): Promise<void> {
  // 1. Synchronous localStorage (instant frame-0 load)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, id);
    } catch {
      // Ignore
    }
  }

  // 2. Chrome Storage Sync (cross-device & survives all rebuilds/updates)
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    try {
      await chrome.storage.sync.set({ [STORAGE_THEME_KEY]: id });
    } catch {
      // Ignore
    }
  }

  // 3. Chrome Storage Local
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    try {
      await chrome.storage.local.set({ [STORAGE_THEME_KEY]: id });
    } catch {
      // Ignore
    }
  }

  // 4. Dexie IndexedDB (indestructible across extension updates)
  try {
    await db.setAICache('theme:preference', id);
  } catch {
    // Ignore
  }
}

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
  const [themeId, setThemeIdState] = useState<ThemeId>(() => getInitialThemeId(initialThemeId));
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

    if (themeToApply.fonts) {
      if (themeToApply.fonts.pixel) {
        root.style.setProperty('--font-pixel', themeToApply.fonts.pixel);
      }
      if (themeToApply.fonts.dialogue) {
        root.style.setProperty('--font-dialogue', themeToApply.fonts.dialogue);
      }
      if (themeToApply.fonts.sans) {
        root.style.setProperty('--font-sans', themeToApply.fonts.sans);
      }
    } else {
      root.style.setProperty('--font-pixel', "'Press Start 2P', monospace");
      root.style.setProperty('--font-dialogue', "'VT323', monospace");
      root.style.setProperty('--font-sans', "'Inter', system-ui, sans-serif");
    }
  }, []);

  // Sync to DOM immediately whenever active themeId changes
  useEffect(() => {
    const current = themesMap[themeId] || getTheme(themeId);
    applyThemeToDom(current);
  }, [applyThemeToDom, themeId, themesMap]);

  // Robust multi-tier async restoration on mount
  useEffect(() => {
    let isMounted = true;

    // If an explicit initialThemeId prop was provided (e.g. in test or storybook), honor it
    if (initialThemeId && initialThemeId in themesMap) {
      return;
    }

    const restoreTheme = async () => {
      // Tier 1: Check chrome.storage.sync (highest durability, survives rebuilds/updates)
      if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
        try {
          const syncRes = await new Promise<{ [key: string]: any }>((resolve) => {
            chrome.storage.sync.get([STORAGE_THEME_KEY], resolve);
          });
          const syncId = syncRes?.[STORAGE_THEME_KEY] as ThemeId;
          if (syncId && syncId in themesMap && isMounted) {
            setThemeIdState(syncId);
            persistThemePreference(syncId);
            return;
          }
        } catch {
          // Fall through
        }
      }

      // Tier 2: Check chrome.storage.local
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        try {
          const localRes = await new Promise<{ [key: string]: any }>((resolve) => {
            chrome.storage.local.get([STORAGE_THEME_KEY], resolve);
          });
          const localId = localRes?.[STORAGE_THEME_KEY] as ThemeId;
          if (localId && localId in themesMap && isMounted) {
            setThemeIdState(localId);
            persistThemePreference(localId);
            return;
          }
        } catch {
          // Fall through
        }
      }

      // Tier 3: Check IndexedDB (Dexie aiCache table)
      try {
        const dbId = await db.getAICache<string>('theme:preference');
        if (dbId && dbId in themesMap && isMounted) {
          setThemeIdState(dbId as ThemeId);
          persistThemePreference(dbId as ThemeId);
          return;
        }
      } catch {
        // Fall through
      }

      // Tier 4: Check localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId | null;
          if (stored && stored in themesMap && isMounted) {
            setThemeIdState(stored);
            persistThemePreference(stored);
            return;
          }
        } catch {
          // Fall through
        }
      }
    };

    restoreTheme();

    // Listen to chrome.storage changes so multiple popups / windows stay in sync
    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
        if ((area === 'sync' || area === 'local') && changes[STORAGE_THEME_KEY]) {
          const newId = changes[STORAGE_THEME_KEY].newValue as ThemeId;
          if (newId && newId in themesMap && isMounted) {
            setThemeIdState(newId);
          }
        }
      };
      chrome.storage.onChanged.addListener(listener);
      return () => {
        isMounted = false;
        chrome.storage.onChanged.removeListener(listener);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [initialThemeId, themesMap]);

  const setThemeId = useCallback((id: ThemeId) => {
    if (!(id in themesMap)) return;
    setThemeIdState(id);
    persistThemePreference(id);
  }, [themesMap]);

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
