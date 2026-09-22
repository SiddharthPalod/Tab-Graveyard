import React, { useState } from 'react';
import { cls } from '../tokens';
import { TabArchetype, ARCHETYPE_META } from '../../core/behavior';
import type { TabRecord } from '../../core/db';
import type { TabActions } from '../../store/useTabs';

interface BehavioralMirrorProps {
  archetypes: Record<TabArchetype, TabRecord[]>;
  actions:    Pick<TabActions, 'sweepByArchetype' | 'collapseArchetypeToTombstone'>;
}

export const BehavioralMirror: React.FC<BehavioralMirrorProps> = ({
  archetypes,
  actions,
}) => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [selectedArch, setSelectedArch]     = useState<TabArchetype | null>(null);

  // List archetypes that currently have at least 1 open tab
  const activeArchetypes = (Object.keys(archetypes) as TabArchetype[]).filter(
    (k) => archetypes[k].length > 0,
  );

  if (activeArchetypes.length === 0) return null;

  const currentMeta  = selectedArch ? ARCHETYPE_META[selectedArch] : null;
  const currentCount = selectedArch ? archetypes[selectedArch].length : 0;

  return (
    <div className={`${cls.card} p-1.5 mb-2 bg-black/80 border-ut-muted`}>
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-pixel text-[8px] text-ut-lv py-0.5 hover:text-white"
      >
        <span className="flex items-center gap-1.5">
          <span>🪞</span>
          <span>BEHAVIORAL MIRROR</span>
          <span className="text-zinc-500 font-dialogue text-xs">({activeArchetypes.length} profiles detected)</span>
        </span>
        <span className="text-zinc-400">{isOpen ? '[COLLAPSE ▲]' : '[MIRROR ▼]'}</span>
      </button>

      {/* Expanded Dashboard */}
      {isOpen && (
        <div className="mt-2 pt-1.5 border-t border-ut-muted space-y-2">
          {/* Archetype Chips */}
          <div className="flex flex-wrap gap-1">
            {activeArchetypes.map((arch) => {
              const meta  = ARCHETYPE_META[arch];
              const count = archetypes[arch].length;
              const isSel = selectedArch === arch;

              return (
                <button
                  key={arch}
                  onClick={() => setSelectedArch(isSel ? null : arch)}
                  className={`font-pixel text-[7.5px] px-1.5 py-0.5 border transition-colors flex items-center gap-1 cursor-pointer ${
                    isSel
                      ? 'border-ut-lv text-ut-lv bg-zinc-900'
                      : 'border-ut-muted text-zinc-400 hover:border-zinc-500 hover:text-white'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.name}</span>
                  <span className="text-ut-lv">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Selected Archetype Insight & One-Click Sweep */}
          {currentMeta && selectedArch && (
            <div className="p-1.5 bg-zinc-950 border border-ut-muted space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] text-ut-lv">
                  {currentMeta.icon} {currentMeta.name} ({currentCount})
                </span>
                <span className="font-dialogue text-xs text-zinc-400">
                  {currentMeta.description}
                </span>
              </div>

              <p className="font-dialogue text-[13px] text-zinc-300 italic">
                {currentMeta.quote}
              </p>

              {/* One-click sweep buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-zinc-800">
                <button
                  onClick={() => actions.sweepByArchetype(selectedArch)}
                  className={`${cls.btn.white} text-[7.5px] px-1.5`}
                  title="Close all tabs of this archetype in Chrome and send to Graveyard"
                >
                  🧹 SWEEP ALL ({currentCount})
                </button>
                <button
                  onClick={() => actions.collapseArchetypeToTombstone(selectedArch)}
                  className={`${cls.btn.battle} text-[7.5px] px-1.5 py-0.5 border-ut-orange text-ut-orange`}
                  title="Collapse all tabs of this archetype into a Tombstone"
                >
                  🪦 TO TOMBSTONE
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
