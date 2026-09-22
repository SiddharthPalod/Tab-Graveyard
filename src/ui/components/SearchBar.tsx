import React from 'react';
import { cls } from '../tokens';

interface SearchBarProps {
  value:       string;
  onChange:    (q: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'type keyword...' }) => (
  <div className={`${cls.card} flex items-center gap-2 px-2.5 py-1 mb-2`}>
    <span className="font-pixel text-[8px] text-ut-lv shrink-0">* SEARCH:</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-transparent font-dialogue text-base text-ut-text outline-none w-full placeholder:text-zinc-600"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="font-pixel text-[8px] text-zinc-400 hover:text-ut-text shrink-0"
      >
        [X]
      </button>
    )}
  </div>
);
