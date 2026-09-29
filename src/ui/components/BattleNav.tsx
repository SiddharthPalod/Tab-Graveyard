import React from 'react';
import { IconGrave, IconTomb, IconGhost, IconAnchor, IconBurger, IconJellyfish } from './GameIcons';
import { useTheme } from '../themes/useTheme';

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
  const { theme } = useTheme();
  const isSponge = theme.id === 'spongebob';

  const tabs = [
    {
      id: 'graveyard' as const,
      label: theme.nav.graveyard.label,
      count: buriedCount,
      icon: isSponge ? <IconAnchor className="text-xs" /> : <IconGrave className="text-xs" />,
      activeColor: 'text-rpg-yellow border-rpg-yellow bg-rpg-surface',
      tooltip: theme.nav.graveyard.tooltip,
    },
    {
      id: 'catacombs' as const,
      label: theme.nav.catacombs.label,
      count: tombstoneCount,
      icon: isSponge ? <IconBurger className="text-xs" /> : <IconTomb className="text-xs" />,
      activeColor: 'text-rpg-magic border-rpg-magic bg-rpg-surface',
      tooltip: theme.nav.catacombs.tooltip,
    },
    {
      id: 'living' as const,
      label: theme.nav.living.label,
      count: livingCount,
      icon: isSponge ? <IconJellyfish className="text-xs" /> : <IconGhost className="text-xs" />,
      activeColor: 'text-rpg-heart border-rpg-heart bg-rpg-surface',
      tooltip: theme.nav.living.tooltip,
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
            title={tab.tooltip}
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
            <span className='leading-none truncate'>{tab.label}</span>
            <span className="opacity-80">({tab.count})</span>
          </button>
        );
      })}
    </div>
  );
};
