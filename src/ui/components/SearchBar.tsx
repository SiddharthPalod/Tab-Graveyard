import React, { useState } from 'react';
import { cls } from '../tokens';
import { ARCHETYPE_META, TabArchetype } from '../../core/behavior';
import type { FilterOptions, SortOption, DomainCount } from '../../core/searchUtils';

export interface SearchBarProps {
  filters:           FilterOptions;
  activeFilterCount: number;
  hasActiveFilters:  boolean;
  onChangeFilters:   (update: Partial<FilterOptions>) => void;
  onResetFilters:    () => void;
  availableDomains?: DomainCount[];
  placeholder?:      string;
}

const AGE_PRESETS: { label: string; days?: number }[] = [
  { label: 'ANY',    days: undefined },
  { label: '> 24H',  days: 1 },
  { label: '> 3D',   days: 3 },
  { label: '> 7D',   days: 7 },
  { label: '> 30D',  days: 30 },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'recent',   label: '🕒 RECENT' },
  { id: 'visits',   label: '👁️ MOST VISITED' },
  { id: 'duration', label: '⌛ FOCUS TIME' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  activeFilterCount,
  hasActiveFilters,
  onChangeFilters,
  onResetFilters,
  availableDomains = [],
  placeholder = 'search title, url or domain...',
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mb-2 shrink-0">
      {/* ── Main Search Input Bar ─────────────────────────────────────────── */}
      <div className={`${cls.card} flex items-center gap-1.5 px-2 py-1`}>
        <span className="font-pixel text-[8px] text-ut-lv shrink-0 select-none">* SEARCH:</span>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => onChangeFilters({ query: e.target.value })}
          placeholder={placeholder}
          className="bg-transparent font-dialogue text-base text-ut-text outline-none w-full placeholder:text-zinc-600"
        />

        {/* Clear query button */}
        {filters.query && (
          <button
            onClick={() => onChangeFilters({ query: '' })}
            className="font-pixel text-[8px] text-zinc-400 hover:text-ut-text px-1 shrink-0 cursor-pointer"
            title="Clear text search"
          >
            [X]
          </button>
        )}

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          className={`font-pixel text-[7.5px] px-1.5 py-0.5 border shrink-0 transition-colors cursor-pointer ${
            activeFilterCount > 0
              ? 'border-ut-orange text-ut-orange bg-zinc-950 hover:bg-ut-orange hover:text-black'
              : drawerOpen
              ? 'border-ut-lv text-ut-lv bg-zinc-950'
              : 'border-zinc-700 text-zinc-400 hover:border-ut-text hover:text-ut-text'
          }`}
          title="Toggle advanced filter drawer"
        >
          {drawerOpen ? '▲ FILTERS' : activeFilterCount > 0 ? `⚙️ FILTERS (${activeFilterCount})` : '⚙️ FILTERS'}
        </button>
      </div>

      {/* ── Active Filter Pills (Quick Dismiss) ───────────────────────────── */}
      {hasActiveFilters && !drawerOpen && (
        <div className="flex items-center gap-1 flex-wrap mt-1 px-0.5">
          {filters.archetype && (
            <button
              onClick={() => onChangeFilters({ archetype: undefined })}
              className="font-pixel text-[7px] border border-yellow-400 text-yellow-400 bg-black/40 px-1 py-0.5 inline-flex items-center gap-1 hover:bg-yellow-400 hover:text-black cursor-pointer"
              title="Click to remove archetype filter"
            >
              {ARCHETYPE_META[filters.archetype]?.icon} {ARCHETYPE_META[filters.archetype]?.name} ✕
            </button>
          )}

          {filters.domain && (
            <button
              onClick={() => onChangeFilters({ domain: undefined })}
              className="font-pixel text-[7px] border border-ut-orange text-ut-orange bg-black/40 px-1 py-0.5 inline-flex items-center gap-1 hover:bg-ut-orange hover:text-black cursor-pointer"
              title="Click to remove domain filter"
            >
              🌐 {filters.domain} ✕
            </button>
          )}

          {filters.minAgeDays && (
            <button
              onClick={() => onChangeFilters({ minAgeDays: undefined })}
              className="font-pixel text-[7px] border border-cyan-400 text-cyan-400 bg-black/40 px-1 py-0.5 inline-flex items-center gap-1 hover:bg-cyan-400 hover:text-black cursor-pointer"
              title="Click to remove age filter"
            >
              ⏳ &gt;{filters.minAgeDays}d ✕
            </button>
          )}

          {filters.sortBy && filters.sortBy !== 'recent' && (
            <button
              onClick={() => onChangeFilters({ sortBy: 'recent' })}
              className="font-pixel text-[7px] border border-ut-lv text-ut-lv bg-black/40 px-1 py-0.5 inline-flex items-center gap-1 hover:bg-ut-lv hover:text-black cursor-pointer"
              title="Click to reset sort to recent"
            >
              🔃 {filters.sortBy === 'visits' ? 'Visits' : 'Focus'} ✕
            </button>
          )}

          <button
            onClick={onResetFilters}
            className="font-pixel text-[7px] text-zinc-500 hover:text-red-400 px-1 py-0.5 ml-auto cursor-pointer"
            title="Reset all filters and text query"
          >
            [RESET ALL]
          </button>
        </div>
      )}

      {/* ── Advanced Filter Drawer ────────────────────────────────────────── */}
      {drawerOpen && (
        <div className={`${cls.card} mt-1 p-2 bg-black/95 border-ut-lv space-y-2 max-h-56 overflow-y-auto pr-1`}>
          {/* 1. Behavioral Archetypes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[7.5px] text-ut-lv">* ARCHETYPE:</span>
              {filters.archetype && (
                <button
                  onClick={() => onChangeFilters({ archetype: undefined })}
                  className="font-pixel text-[6.5px] text-zinc-500 hover:text-white cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => onChangeFilters({ archetype: undefined })}
                className={`font-pixel text-[7px] px-1 py-0.5 border cursor-pointer ${
                  !filters.archetype
                    ? 'border-ut-lv text-ut-lv bg-zinc-900 font-bold'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                }`}
              >
                ALL
              </button>
              {(Object.keys(ARCHETYPE_META) as TabArchetype[]).map((arch) => {
                const meta = ARCHETYPE_META[arch];
                const isActive = filters.archetype === arch;
                return (
                  <button
                    key={arch}
                    onClick={() => onChangeFilters({ archetype: isActive ? undefined : arch })}
                    className={`font-pixel text-[7px] px-1 py-0.5 border cursor-pointer inline-flex items-center gap-1 ${
                      isActive
                        ? 'border-yellow-400 text-yellow-400 bg-zinc-900 font-bold'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                    title={meta.description}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Top Domain Chips */}
          {availableDomains.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[7.5px] text-ut-orange">* TOP DOMAINS:</span>
                {filters.domain && (
                  <button
                    onClick={() => onChangeFilters({ domain: undefined })}
                    className="font-pixel text-[6.5px] text-zinc-500 hover:text-white cursor-pointer"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableDomains.map(({ domain, count }) => {
                  const isActive = (filters.domain || '').toLowerCase() === domain.toLowerCase();
                  return (
                    <button
                      key={domain}
                      onClick={() => onChangeFilters({ domain: isActive ? undefined : domain })}
                      className={`font-pixel text-[7px] px-1.5 py-0.5 border cursor-pointer inline-flex items-center gap-1 ${
                        isActive
                          ? 'border-ut-orange text-ut-orange bg-zinc-900 font-bold'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                      }`}
                    >
                      <span>🌐 {domain}</span>
                      <span className="text-zinc-500 text-[6.5px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Inactivity Age Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[7.5px] text-cyan-400">* INACTIVITY AGE:</span>
              {filters.minAgeDays && (
                <button
                  onClick={() => onChangeFilters({ minAgeDays: undefined })}
                  className="font-pixel text-[6.5px] text-zinc-500 hover:text-white cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {AGE_PRESETS.map((preset) => {
                const isActive = filters.minAgeDays === preset.days;
                return (
                  <button
                    key={preset.label}
                    onClick={() => onChangeFilters({ minAgeDays: preset.days })}
                    className={`font-pixel text-[7px] px-1.5 py-0.5 border cursor-pointer ${
                      isActive
                        ? 'border-cyan-400 text-cyan-400 bg-zinc-900 font-bold'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Sort Ordering */}
          <div>
            <div className="mb-1">
              <span className="font-pixel text-[7.5px] text-ut-lv">* SORT ORDER:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {SORT_OPTIONS.map((opt) => {
                const isActive = (filters.sortBy || 'recent') === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onChangeFilters({ sortBy: opt.id })}
                    className={`font-pixel text-[7px] px-1.5 py-0.5 border cursor-pointer ${
                      isActive
                        ? 'border-ut-lv text-ut-lv bg-zinc-900 font-bold'
                        : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer Controls */}
          <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className={`font-pixel text-[7px] px-1.5 py-0.5 border ${
                hasActiveFilters
                  ? 'border-red-500/60 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer'
                  : 'border-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              [RESET ALL]
            </button>

            <button
              onClick={() => setDrawerOpen(false)}
              className="font-pixel text-[7px] border border-ut-text text-ut-text px-2 py-0.5 hover:bg-ut-text hover:text-black cursor-pointer"
            >
              [CLOSE ▲]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
