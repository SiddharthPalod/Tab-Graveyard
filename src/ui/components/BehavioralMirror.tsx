import React, { useState } from 'react';
import { TabArchetype, TabViewModel, ARCHETYPE_META } from '../../core/behavior';
import type { TabRecord } from '../../core/db';
import type { TabActions } from '../../store/useTabs';
import { PixelPanel, PixelButton } from './RPGPrimitives';
import { IconMirror, IconSweep, IconTomb } from './GameIcons';

interface BehavioralMirrorProps {
  archetypes: Record<TabArchetype, (TabRecord | TabViewModel)[]>;
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
    <PixelPanel className="p-2 mb-2 !border-rpg-monster !bg-rpg-bg">
      {/* Header / Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-pixel text-[8px] text-rpg-monster py-0.5 hover:text-rpg-white cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <IconMirror className="text-sm" />
          <span>BEHAVIORAL MIRROR</span>
          <span className="text-rpg-light-gray font-dialogue text-sm">({activeArchetypes.length} profiles)</span>
        </span>
        <span className="text-rpg-mid-gray">{isOpen ? '[COLLAPSE ▲]' : '[MIRROR ▼]'}</span>
      </button>

      {/* Expanded Dashboard */}
      {isOpen && (
        <div className="mt-2 pt-2 border-t-2 border-rpg-mid-gray space-y-2">
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
                  className={`font-pixel text-[7.5px] px-2 py-1 border-2 transition-colors flex items-center gap-1 cursor-pointer ${
                    isSel
                      ? 'border-rpg-monster text-rpg-monster bg-rpg-dark-gray'
                      : 'border-rpg-mid-gray text-rpg-light-gray hover:border-rpg-white hover:text-rpg-white'
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
            <div className="p-2 bg-rpg-dark-gray border-2 border-rpg-mid-gray space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[8px] text-rpg-monster">
                  {currentMeta.icon} {currentMeta.name} ({currentCount})
                </span>
                <span className="font-dialogue text-sm text-rpg-light-gray">
                  {currentMeta.description}
                </span>
              </div>

              <p className="font-dialogue text-base text-rpg-white italic leading-snug">
                {currentMeta.quote}
              </p>

              {/* One-click sweep buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-rpg-mid-gray">
                <PixelButton
                  onClick={() => actions.sweepByArchetype(selectedArch)}
                  title="Close all tabs of this archetype in Chrome and send to Graveyard"
                  className="gap-1 flex items-center"
                >
                  <IconSweep />
                  <span>[SWEEP ({currentCount})]</span>
                </PixelButton>
                <PixelButton
                  onClick={() => actions.collapseArchetypeToTombstone(selectedArch)}
                  className="!border-rpg-yellow !text-rpg-yellow hover:!bg-rpg-yellow hover:!text-rpg-bg gap-1 flex items-center"
                  title="Collapse all tabs of this archetype into a Tombstone"
                >
                  <IconTomb />
                  <span>[TO TOMBSTONE]</span>
                </PixelButton>
              </div>
            </div>
          )}
        </div>
      )}
    </PixelPanel>
  );
};
