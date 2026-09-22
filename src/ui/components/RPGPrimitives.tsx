import React, { useEffect, useState } from 'react';

// ── Generic Wrapper Types ──────────────────────────────────────────────────
type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * DialogueBox: A classic RPG dialogue container.
 * Black bg, 3px white solid border, hard shadow.
 */
export const DialogueBox: React.FC<DivProps & { shadow?: boolean }> = ({ 
  children, 
  className = '', 
  shadow = true,
  ...props 
}) => {
  return (
    <div 
      className={`border-[3px] border-rpg-white bg-rpg-bg text-rpg-white p-3 font-dialogue text-lg leading-tight ${shadow ? 'shadow-pixel' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PixelPanel: A standard pane/window (e.g. for inventory list)
 * 2px border, slightly lighter shadow.
 */
export const PixelPanel: React.FC<DivProps & { shadow?: boolean }> = ({ 
  children, 
  className = '', 
  shadow = true,
  ...props 
}) => {
  return (
    <div 
      className={`border-2 border-rpg-mid-gray bg-rpg-dark-gray text-rpg-white p-2 font-pixel text-[10px] ${shadow ? 'shadow-pixel' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * PixelButton: Interactive RPG button with a Soul Cursor (♥) on hover.
 */
export const PixelButton: React.FC<ButtonProps & { active?: boolean }> = ({ 
  children, 
  className = '', 
  active = false,
  ...props 
}) => {
  return (
    <button 
      className={`
        group relative flex items-center gap-2 px-2 py-1 font-pixel text-[10px] uppercase
        border-2 bg-rpg-bg text-rpg-white cursor-pointer transition-transform duration-100 ease-in-out
        hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none
        ${active ? 'border-rpg-soul text-rpg-soul shadow-pixel-hover' : 'border-rpg-mid-gray hover:border-rpg-white hover:text-rpg-yellow shadow-pixel'}
        ${className}
      `}
      {...props}
    >
      <span className={`text-rpg-soul opacity-0 transition-opacity duration-100 ${active ? 'opacity-100' : 'group-hover:opacity-100'} animate-pulse`}>
        ♥
      </span>
      <span>{children}</span>
    </button>
  );
};

/**
 * TypewriterText: Types out text character by character.
 */
export const TypewriterText: React.FC<{ text: string; speed?: number; className?: string }> = ({ 
  text, 
  speed = 30, 
  className = '' 
}) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText(''); // Reset on text change

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayedText}</span>;
};
