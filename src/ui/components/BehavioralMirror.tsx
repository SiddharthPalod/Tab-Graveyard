import React, { useState } from 'react';
import { TabArchetype, TabViewModel, ARCHETYPE_META } from '../../core/behavior';
import type { TabRecord } from '../../core/db';
import type { TabActions } from '../../store/useTabs';
import { IconMirror } from './GameIcons';
import { useTheme } from '../themes/useTheme';

interface BehavioralMirrorProps {
  archetypes: Record<TabArchetype, (TabRecord | TabViewModel)[]>;
  actions:    Pick<TabActions, 'sweepByArchetype' | 'collapseArchetypeToTombstone'>;
}

export const BehavioralMirror: React.FC<BehavioralMirrorProps> = ({
  archetypes,
  actions,
}) => {
  const { theme } = useTheme();

  const [isOpen, setIsOpen]                 = useState(false);
  const [selectedArch, setSelectedArch]     = useState<TabArchetype | null>(null);

  const SweepIcon = theme.icons.sweep;
  const VaultIcon = theme.icons.vault;

  // List archetypes that currently have at least 1 open tab
  const activeArchetypes = (Object.keys(archetypes) as TabArchetype[]).filter(
    (k) => archetypes[k].length > 0,
  );

  if (activeArchetypes.length === 0) return null;

  const currentMeta  = selectedArch ? (theme.archetypes?.[selectedArch] || ARCHETYPE_META[selectedArch]) : null;
  const currentCount = selectedArch ? archetypes[selectedArch].length : 0;

  return (
    <div className="p-2 mb-1.5 bg-rpg-dark-gray/80 border border-rpg-monster/40 rounded-sm shadow-pixel">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-pixel text-[7.5px] text-rpg-monster py-0.5 hover:text-rpg-white cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <IconMirror className="text-xs" />
          <span>{theme.mirrorTitle || 'BEHAVIORAL MIRROR'}</span>
          <span className="text-rpg-light-gray/70 font-sans text-[10.5px]">({activeArchetypes.length} active)</span>
        </span>
        <span className="font-pixel text-[7.5px] text-rpg-light-gray hover:text-rpg-white px-1 py-0.5 cursor-pointer bg-rpg-bg border border-rpg-border">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Expanded Dashboard */}
      {isOpen && (
        <div className="mt-2 pt-2 border-t border-rpg-border/60 space-y-2">
          {/* Archetype Chips */}
          <div className="flex flex-wrap gap-1">
            {activeArchetypes.map((arch) => {
              const meta  = theme.archetypes?.[arch] || ARCHETYPE_META[arch];
              const count = archetypes[arch].length;
              const isSel = selectedArch === arch;

              return (
                <button
                  key={arch}
                  onClick={() => setSelectedArch(isSel ? null : arch)}
                  className={`font-pixel text-[7px] px-1.5 py-0.5 border transition-colors flex items-center gap-1 cursor-pointer rounded-none ${
                    isSel
                      ? 'border-rpg-monster text-rpg-monster bg-rpg-surface font-bold shadow-pixel'
                      : 'border-rpg-border text-rpg-light-gray hover:border-rpg-light-gray hover:text-rpg-white'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="text-rpg-monster">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Selected Archetype Insight & One-Click Sweep */}
          {currentMeta && selectedArch && (
            <div className="p-2 bg-rpg-surface/80 border border-rpg-border space-y-1.5 rounded-none">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[7.5px] text-rpg-monster">
                  {currentMeta.icon} {currentMeta.name} ({currentCount})
                </span>
                <span className="font-sans text-[10.5px] text-rpg-light-gray">
                  {currentMeta.description}
                </span>
              </div>

              <p className="font-dialogue text-sm text-rpg-white italic leading-tight">
                {currentMeta.quote}
              </p>

              {/* One-click solid action buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-rpg-border/60">
                <button
                  onClick={() => actions.sweepByArchetype(selectedArch)}
                  title="Close all tabs of this archetype in Chrome and store them"
                  className={theme.cls.btn.sweep}
                >
                  <SweepIcon className="text-xs" />
                  <span>{theme.actions.sweep} ({currentCount})</span>
                </button>
                <button
                  onClick={() => actions.collapseArchetypeToTombstone(selectedArch)}
                  className={theme.cls.btn.accent}
                  title="Collapse all tabs of this profile into a vault or tombstone"
                >
                  <VaultIcon className="text-xs" />
                  <span>{theme.labels.collapseArchetype}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
