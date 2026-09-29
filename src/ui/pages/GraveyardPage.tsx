import React, { useState } from 'react';
import { QUOTES } from '../tokens';
import { TabItem } from '../components/TabItem';
import type { TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { TypewriterText } from '../components/RPGPrimitives';
import {
  IconErect,
  IconCremate,
  IconGrave,
} from '../components/GameIcons';

interface GraveyardPageProps {
  tabs: TabViewModel[];
  searchQuery: string;
  loading: boolean;
  hoveredUrl: string | null;
  onHover: (url: string | null) => void;
  keepCount: number;
  cremateCount: number;
  totalDead: number;
  actions: Pick<
    TabActions,
    | 'revive'
    | 'purge'
    | 'sweep'
    | 'bundleGravesToTombstone'
    | 'cremateOldest'
    | 'setKeepCount'
  >;
}

export const GraveyardPage: React.FC<GraveyardPageProps> = ({
  tabs,
  searchQuery,
  loading,
  hoveredUrl,
  onHover,
  keepCount,
  cremateCount,
  totalDead,
  actions,
}) => {
  const [selectedUrls, setSelectedUrls] = useState<Record<string, boolean>>(
    {},
  );

  const [namingOpen, setNamingOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  /* ============================================================
     LOADING STATE
     ============================================================ */

  if (loading) {
    return (
      <div className="p-3 bg-rpg-dark-gray/90 border border-rpg-border text-center text-rpg-yellow font-dialogue text-base rounded-sm">
        <TypewriterText text={QUOTES.checkingDust} />
      </div>
    );
  }

  /* ============================================================
     EMPTY STATE
     ============================================================ */

  if (tabs.length === 0) {
    return (
      <div className="p-6 bg-rpg-dark-gray/80 border border-rpg-border text-center space-y-2 rounded-sm shadow-pixel">
        <div className="flex justify-center text-rpg-mid-gray">
          <IconGrave className="text-4xl" />
        </div>

        <p className="text-slate-200 font-sans text-xs">
          <TypewriterText
            text={
              searchQuery
                ? QUOTES.noResults
                : QUOTES.emptyGraveyard
            }
          />
        </p>

        {!searchQuery && (
          <p className="text-[11px] text-rpg-light-gray font-sans">
            {QUOTES.hintBuried}
          </p>
        )}
      </div>
    );
  }

  /* ============================================================
     SELECTION
     ============================================================ */

  const toggleSelect = (cleanUrl: string) => {
    setSelectedUrls((prev) => ({
      ...prev,
      [cleanUrl]: !prev[cleanUrl],
    }));
  };

  const selectedTabs = tabs.filter(
    (tab) => selectedUrls[tab.cleanUrl],
  );

  const hasSelection = selectedTabs.length > 0;

  const handleSelectAll = () => {
    if (hasSelection) {
      setSelectedUrls({});
      return;
    }

    const all: Record<string, boolean> = {};

    tabs.forEach((tab) => {
      all[tab.cleanUrl] = true;
    });

    setSelectedUrls(all);
  };

  /* ============================================================
     TOMBSTONE
     ============================================================ */

  const handleConfirmBundle = async () => {
    await actions.bundleGravesToTombstone(
      selectedTabs,
      customTitle,
    );

    setSelectedUrls({});
    setCustomTitle('');
    setNamingOpen(false);
  };

  /* ============================================================
     CREMATE
     ============================================================ */

  const handleCremate = async () => {
    if (cremateCount <= 0) return;

    await actions.cremateOldest(keepCount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ========================================================
          TOP ACTION / CLEANUP BAR
          ======================================================== */}

      <div className="p-2.5 mb-2 bg-rpg-dark-gray/80 border border-rpg-border rounded-sm">

        {namingOpen ? (

          /* ====================================================
             NAME TOMBSTONE MODE
             ==================================================== */

          <div className="space-y-2">

            <p className="font-pixel text-[7.5px] text-rpg-yellow">
              * NAME THIS TOMBSTONE ({selectedTabs.length} GRAVES):
            </p>

            <div className="flex items-center gap-2">

              <input
                type="text"
                value={customTitle}
                onChange={(e) =>
                  setCustomTitle(e.target.value)
                }
                placeholder="auto-name (leave blank) or type title..."
                className="
                  flex-1
                  min-w-0
                  bg-rpg-bg
                  border
                  border-rpg-border
                  font-sans
                  text-xs
                  px-2
                  py-1.5
                  text-rpg-white
                  outline-none
                  placeholder:text-rpg-mid-gray
                "
                autoFocus
              />

              <button
                onClick={handleConfirmBundle}
                className="
                  font-pixel
                  text-[8px]
                  bg-amber-600
                  hover:bg-amber-500
                  text-slate-950
                  font-bold
                  px-3
                  py-1.5
                  inline-flex
                  items-center
                  justify-center
                  gap-1
                  cursor-pointer
                  whitespace-nowrap
                  shrink-0
                "
              >
                <IconErect className="text-xs shrink-0" />
                <span>ERECT</span>
              </button>

              <button
                onClick={() => setNamingOpen(false)}
                className="
                  font-pixel
                  text-[7.5px]
                  text-rpg-mid-gray
                  hover:text-rpg-white
                  px-2
                  py-1.5
                  cursor-pointer
                  whitespace-nowrap
                  shrink-0
                "
              >
                CANCEL
              </button>

            </div>
          </div>

        ) : (

          /* ====================================================
             NORMAL ACTION MODE
             ==================================================== */

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-x-4
              gap-y-2
            "
          >

            {/* ------------------------------------------------
                LEFT: SELECT / ERECT
                ------------------------------------------------ */}

            <div className="flex items-center gap-2 shrink-0">

              <button
                onClick={handleSelectAll}
                className="
                  font-pixel
                  text-[7.5px]
                  text-rpg-light-gray
                  hover:text-rpg-yellow
                  cursor-pointer
                  whitespace-nowrap
                "
              >
                {hasSelection
                  ? `[DESELECT (${selectedTabs.length})]`
                  : '[SELECT ALL]'}
              </button>

              {hasSelection && (
                <button
                  onClick={() => setNamingOpen(true)}
                  className="
                    font-pixel
                    text-[8px]
                    bg-amber-600
                    hover:bg-amber-500
                    text-slate-950
                    font-bold
                    px-2.5
                    py-1.5
                    inline-flex
                    items-center
                    justify-center
                    gap-1
                    cursor-pointer
                    whitespace-nowrap
                    shrink-0
                  "
                  title="Bundle selected dead tabs into a permanent Tombstone in Catacombs"
                >
                  <IconErect className="text-xs shrink-0" />
                  <span>
                    ERECT ({selectedTabs.length})
                  </span>
                </button>
              )}

            </div>

            {/* ------------------------------------------------
                RIGHT: KEEP / CREMATE
                ------------------------------------------------ */}

            <div
              className="
                flex
                items-center
                gap-1.5
                shrink-0
              "
            >

              <span
                className="
                  font-pixel
                  text-[7.5px]
                  text-rpg-mid-gray
                  whitespace-nowrap
                "
              >
                KEEP:
              </span>

              <input
                type="number"
                min="0"
                max="500"
                value={keepCount}
                onChange={(e) =>
                  actions.setKeepCount(
                    parseInt(e.target.value, 10),
                  )
                }
                className="
                  w-12
                  h-8
                  bg-rpg-bg
                  border
                  border-rpg-border
                  font-pixel
                  text-[7.5px]
                  text-center
                  text-rpg-yellow
                  outline-none
                  shrink-0
                "
                title="Number of newest dead tabs to keep"
              />

              <button
                onClick={handleCremate}
                disabled={cremateCount === 0}
                className={`
                  font-pixel
                  text-[8px]
                  px-3
                  py-1.5
                  uppercase
                  inline-flex
                  items-center
                  justify-center
                  gap-1
                  whitespace-nowrap
                  shrink-0
                  transition-all

                  ${
                    cremateCount === 0
                      ? `
                        bg-rose-950/40
                        text-rose-300/40
                        border
                        border-rose-950/40
                        cursor-not-allowed
                      `
                      : `
                        bg-rose-900/90
                        hover:bg-rose-700
                        text-rose-100
                        border
                        border-rose-500/50
                        shadow-pixel
                        cursor-pointer
                      `
                  }
                `}
                title={`Keep the newest ${keepCount} tabs, delete the oldest ${cremateCount} tabs (${cremateCount}/${totalDead})`}
              >
                <IconCremate className="text-xs shrink-0" />

                <span>
                  CREMATE ({cremateCount})
                </span>
              </button>

            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          LIST OF BURIED TABS
          ======================================================== */}

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
        {tabs.map((tab) => (
          <TabItem
            key={tab.cleanUrl}
            tab={tab}
            isHovered={hoveredUrl === tab.cleanUrl}
            onHover={onHover}
            actions={actions}
            isSelected={Boolean(
              selectedUrls[tab.cleanUrl],
            )}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
};