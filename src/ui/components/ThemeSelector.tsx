import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../themes/useTheme';

export const ThemeSelector: React.FC = () => {
  const { theme, themeId, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const shortName = theme.shortName || (theme.id === 'spongebob' ? 'BIKINI' : 'GRAVE');

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="font-pixel text-[7px] px-1.5 py-0.5 border border-rpg-border hover:border-rpg-yellow bg-rpg-surface text-rpg-yellow hover:text-rpg-white cursor-pointer inline-flex items-center gap-1 transition-all rounded-none shadow-pixel-hover"
        title="Change theme personality"
        aria-expanded={isOpen}
      >
        <span>{theme.icon}</span>
        <span className="text-[6.5px] tracking-tight">{shortName}</span>
        <span className="text-[6px] opacity-70 leading-none">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-rpg-dark-gray border border-rpg-border shadow-pixel z-50 py-1 text-left">
          <div className="px-2 py-1 border-b border-rpg-border/60 flex items-center justify-between">
            <span className="font-pixel text-[6.5px] text-rpg-light-gray uppercase tracking-wider">
              THEMES ({availableThemes.length})
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto py-0.5">
            {availableThemes.map((t) => {
              const isSelected = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setThemeId(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-2 py-1.5 flex items-center justify-between text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-rpg-surface text-rpg-yellow font-bold'
                      : 'text-rpg-white hover:bg-rpg-surface/60 hover:text-rpg-yellow'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="text-xs shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="font-pixel text-[7.5px] truncate leading-tight">
                        {t.name}
                      </p>
                      <p className="font-sans text-[9.5px] text-rpg-light-gray/80 truncate leading-tight mt-0.5">
                        {t.tagline}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="font-pixel text-[7px] text-rpg-yellow ml-1 shrink-0">
                      ✔
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
