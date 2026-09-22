import React from 'react';
import { PixelButton } from './RPGPrimitives';
import { IconGrave, IconTomb, IconGhost } from './GameIcons';

export type ActivePage = 'graveyard' | 'catacombs' | 'living';

interface BattleNavProps {
  activePage:     ActivePage;
  onSelectPage:   (p: ActivePage) => void;
  buriedCount:    number;
  tombstoneCount: number;
  livingCount:    number;
}

export const BattleNav: React.FC<BattleNavProps> = ({
  activePage,
  onSelectPage,
  buriedCount,
  tombstoneCount,
  livingCount,
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-2 shrink-0">
      <PixelButton
        active={activePage === 'graveyard'}
        onClick={() => onSelectPage('graveyard')}
        className="justify-center flex-col gap-1 py-2"
      >
        <IconGrave className="text-xl" />
        <span>GRAVE ({buriedCount})</span>
      </PixelButton>

      <PixelButton
        active={activePage === 'catacombs'}
        onClick={() => onSelectPage('catacombs')}
        className="justify-center flex-col gap-1 py-2"
      >
        <IconTomb className="text-xl" />
        <span>TOMBS ({tombstoneCount})</span>
      </PixelButton>

      <PixelButton
        active={activePage === 'living'}
        onClick={() => onSelectPage('living')}
        className="justify-center flex-col gap-1 py-2"
      >
        <IconGhost className="text-xl" />
        <span>LIVING ({livingCount})</span>
      </PixelButton>
    </div>
  );
};
