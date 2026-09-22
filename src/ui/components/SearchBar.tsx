import React, { useState } from 'react';
import { ARCHETYPE_META, TabArchetype } from '../../core/behavior';
import type { FilterOptions, SortOption, DomainCount } from '../../core/searchUtils';
import { IconSearch } from './GameIcons';

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
  placeholder = 'search...',
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="shrink-0 w-full">
      {/* ── Main Search Input Bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-rpg-dark-gray border-b-2 border-rpg-mid-gray">
        <span className="font-pixel text-[8px] text-rpg-yellow shrink-0 select-none pl-1 inline-flex items-center gap-1">
          <IconSearch /> SEARCH:
        </span>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => onChangeFilters({ query: e.target.value })}
          placeholder={placeholder}
          className="bg-transparent font-dialogue text-base text-rpg-white outline-none w-full placeholder:text-rpg-mid-gray"
        />

        {/* Clear query button */}
        {filters.query && (
          <button
            onClick={() => onChangeFilters({ query: '' })}
            className="font-pixel text-[8px] text-rpg-light-gray hover:text-rpg-white px-1 shrink-0 cursor-pointer"
            title="Clear text search"
          >
            [X]
          </button>
        )}

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          className={`font-pixel text-[7.5px] px-1.5 py-1 border-2 shrink-0 transition-colors cursor-pointer ${
            activeFilterCount > 0
              ? 'border-rpg-yellow text-rpg-yellow bg-rpg-bg hover:bg-rpg-yellow hover:text-rpg-bg'
              : drawerOpen
              ? 'border-rpg-white text-rpg-white bg-rpg-bg'
              : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
          }`}
          title="Toggle advanced filter drawer"
        >
          {drawerOpen ? '▲ FILTERS' : activeFilterCount > 0 ? `⚙️ FILTERS (${activeFilterCount})` : '⚙️ FILTERS'}
        </button>
      </div>

      {/* ── Active Filter Pills (Quick Dismiss) ───────────────────────────── */}
      {hasActiveFilters && !drawerOpen && (
        <div className="flex items-center gap-1 flex-wrap p-1 bg-rpg-bg border-b-2 border-rpg-mid-gray">
          {filters.archetype && (
            <button
              onClick={() => onChangeFilters({ archetype: undefined })}
              className="font-pixel text-[7px] border-2 border-rpg-yellow text-rpg-yellow bg-rpg-bg px-1 py-0.5 inline-flex items-center gap-1 hover:bg-rpg-yellow hover:text-rpg-bg cursor-pointer"
            >
              {ARCHETYPE_META[filters.archetype]?.icon} {ARCHETYPE_META[filters.archetype]?.name} ✕
            </button>
          )}

          {filters.domain && (
            <button
              onClick={() => onChangeFilters({ domain: undefined })}
              className="font-pixel text-[7px] border-2 border-rpg-magic text-rpg-magic bg-rpg-bg px-1 py-0.5 inline-flex items-center gap-1 hover:bg-rpg-magic hover:text-rpg-bg cursor-pointer"
            >
              🌐 {filters.domain} ✕
            </button>
          )}

          {filters.minAgeDays && (
            <button
              onClick={() => onChangeFilters({ minAgeDays: undefined })}
              className="font-pixel text-[7px] border-2 border-rpg-heart text-rpg-heart bg-rpg-bg px-1 py-0.5 inline-flex items-center gap-1 hover:bg-rpg-heart hover:text-rpg-bg cursor-pointer"
            >
              ⏳ &gt;{filters.minAgeDays}d ✕
            </button>
          )}

          {filters.sortBy && filters.sortBy !== 'recent' && (
            <button
              onClick={() => onChangeFilters({ sortBy: 'recent' })}
              className="font-pixel text-[7px] border-2 border-rpg-white text-rpg-white bg-rpg-bg px-1 py-0.5 inline-flex items-center gap-1 hover:bg-rpg-white hover:text-rpg-bg cursor-pointer"
            >
              🔃 {filters.sortBy === 'visits' ? 'Visits' : 'Focus'} ✕
            </button>
          )}

          <button
            onClick={onResetFilters}
            className="font-pixel text-[7px] text-rpg-mid-gray hover:text-rpg-soul px-1 py-0.5 ml-auto cursor-pointer"
          >
            [RESET ALL]
          </button>
        </div>
      )}

      {/* ── Advanced Filter Drawer ────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="p-2 bg-rpg-bg border-b-2 border-rpg-mid-gray space-y-2 max-h-56 overflow-y-auto pr-1">
          {/* 1. Behavioral Archetypes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[7.5px] text-rpg-yellow">* ARCHETYPE:</span>
              {filters.archetype && (
                <button
                  onClick={() => onChangeFilters({ archetype: undefined })}
                  className="font-pixel text-[6.5px] text-rpg-mid-gray hover:text-rpg-white cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => onChangeFilters({ archetype: undefined })}
                className={`font-pixel text-[7px] px-1 py-0.5 border-2 cursor-pointer ${
                  !filters.archetype
                    ? 'border-rpg-yellow text-rpg-yellow bg-rpg-dark-gray font-bold'
                    : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
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
                    className={`font-pixel text-[7px] px-1 py-0.5 border-2 cursor-pointer inline-flex items-center gap-1 ${
                      isActive
                        ? 'border-rpg-yellow text-rpg-yellow bg-rpg-dark-gray font-bold'
                        : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
                    }`}
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
                <span className="font-pixel text-[7.5px] text-rpg-magic">* TOP DOMAINS:</span>
                {filters.domain && (
                  <button
                    onClick={() => onChangeFilters({ domain: undefined })}
                    className="font-pixel text-[6.5px] text-rpg-mid-gray hover:text-rpg-white cursor-pointer"
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
                      className={`font-pixel text-[7px] px-1.5 py-0.5 border-2 cursor-pointer inline-flex items-center gap-1 ${
                        isActive
                          ? 'border-rpg-magic text-rpg-magic bg-rpg-dark-gray font-bold'
                          : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
                      }`}
                    >
                      <span>🌐 {domain}</span>
                      <span className="text-rpg-mid-gray text-[6.5px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Inactivity Age Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[7.5px] text-rpg-heart">* INACTIVITY AGE:</span>
              {filters.minAgeDays && (
                <button
                  onClick={() => onChangeFilters({ minAgeDays: undefined })}
                  className="font-pixel text-[6.5px] text-rpg-mid-gray hover:text-rpg-white cursor-pointer"
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
                    className={`font-pixel text-[7px] px-1.5 py-0.5 border-2 cursor-pointer ${
                      isActive
                        ? 'border-rpg-heart text-rpg-heart bg-rpg-dark-gray font-bold'
                        : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
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
              <span className="font-pixel text-[7.5px] text-rpg-white">* SORT ORDER:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {SORT_OPTIONS.map((opt) => {
                const isActive = (filters.sortBy || 'recent') === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => onChangeFilters({ sortBy: opt.id })}
                    className={`font-pixel text-[7px] px-1.5 py-0.5 border-2 cursor-pointer ${
                      isActive
                        ? 'border-rpg-white text-rpg-white bg-rpg-dark-gray font-bold'
                        : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer Controls */}
          <div className="pt-2 mt-2 border-t-2 border-rpg-mid-gray flex items-center justify-between">
            <button
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className={`font-pixel text-[7px] px-1.5 py-0.5 border-2 ${
                hasActiveFilters
                  ? 'border-rpg-soul text-rpg-soul hover:bg-rpg-soul hover:text-rpg-bg cursor-pointer'
                  : 'border-rpg-mid-gray text-rpg-mid-gray cursor-not-allowed'
              }`}
            >
              [RESET ALL]
            </button>

            <button
              onClick={() => setDrawerOpen(false)}
              className="font-pixel text-[7px] border-2 border-rpg-white text-rpg-white px-2 py-0.5 hover:bg-rpg-white hover:text-rpg-bg cursor-pointer"
            >
              [CLOSE ▲]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
