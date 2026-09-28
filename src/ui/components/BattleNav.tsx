import React from 'react';
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
  const tabs = [
    {
      id: 'graveyard' as const,
      label: 'GRAVE',
      count: buriedCount,
      icon: <IconGrave className="text-xs" />,
      activeColor: 'text-rpg-yellow border-rpg-yellow bg-rpg-surface',
    },
    {
      id: 'catacombs' as const,
      label: 'TOMBS',
      count: tombstoneCount,
      icon: <IconTomb className="text-xs" />,
      activeColor: 'text-rpg-magic border-rpg-magic bg-rpg-surface',
    },
    {
      id: 'living' as const,
      label: 'LIVING',
      count: livingCount,
      icon: <IconGhost className="text-xs" />,
      activeColor: 'text-rpg-heart border-rpg-heart bg-rpg-surface',
    },
  ];
 
  return (
    <div className="grid grid-cols-3 gap-1.5 shrink-0 bg-rpg-bg/60 p-1 border border-rpg-border rounded-sm">
      {tabs.map((tab) => {
        const isActive = activePage === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectPage(tab.id)}
            className={`
              flex items-center justify-center gap-1.5 py-1.5 px-2 font-pixel text-[8px] uppercase
              leading-none transition-all duration-100 cursor-pointer rounded-none border
              ${isActive 
                ? `${tab.activeColor} font-bold shadow-pixel-hover translate-y-[1px]` 
                : 'border-transparent text-rpg-light-gray hover:text-rpg-white hover:bg-rpg-surface/40'
              }
            `}
          >
            {tab.icon}
            <span className='leading-none'>{tab.label}</span>
            <span className="opacity-80">({tab.count})</span>
          </button>
        );
      })}
    </div>
  );
};
