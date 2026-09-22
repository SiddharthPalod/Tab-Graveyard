import React from 'react';
import { cls } from '../tokens';

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
  const active = 'border-ut-lv text-ut-lv';

  return (
    <div className="grid grid-cols-3 gap-1.5 mb-2">
      <button
        onClick={() => onSelectPage('graveyard')}
        className={`${cls.btn.battle} text-[7.5px] px-1.5 py-1.5 ${activePage === 'graveyard' ? active : ''}`}
      >
        {activePage === 'graveyard' ? <span className="text-ut-soul">❤️</span> : '💀'}
        GRAVE ({buriedCount})
      </button>

      <button
        onClick={() => onSelectPage('catacombs')}
        className={`${cls.btn.battle} text-[7.5px] px-1.5 py-1.5 ${activePage === 'catacombs' ? active : ''}`}
      >
        {activePage === 'catacombs' ? <span className="text-ut-soul">❤️</span> : '🪦'}
        TOMBS ({tombstoneCount})
      </button>

      <button
        onClick={() => onSelectPage('living')}
        className={`${cls.btn.battle} text-[7.5px] px-1.5 py-1.5 ${activePage === 'living' ? active : ''}`}
      >
        {activePage === 'living' ? <span className="text-ut-soul">❤️</span> : '👻'}
        LIVING ({livingCount})
      </button>
    </div>
  );
};
