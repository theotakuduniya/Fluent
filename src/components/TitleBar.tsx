import React from 'react';
import { Search, Sun, Moon, X, Users } from 'lucide-react';

interface TitleBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  contactCount?: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="h-11 bg-white dark:bg-[#202020] flex items-center justify-between px-3 border-b border-black/[0.08] dark:border-white/[0.08] select-none z-30 shrink-0 relative transition-colors duration-150">
      {/* Zone 1: Brand & Window Title */}
      <div className="flex items-center gap-2.5 min-w-[140px] sm:min-w-[180px]">
        <div className="w-6 h-6 rounded-md bg-[#0078d4] text-white flex items-center justify-center shadow-xs">
          <Users className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold tracking-tight text-[#18181b] dark:text-[#f4f4f5]">
            Fluent Contacts
          </span>
        </div>
      </div>

      {/* Zone 2: Perfectly Centered Search Box */}
      <div className="flex-1 max-w-md mx-auto px-2 flex justify-center">
        <div className="relative w-full max-w-sm flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#71717a] dark:text-[#a1a1aa] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts, phones, companies..."
            className="w-full h-7 pl-8 pr-7 text-xs bg-[#f4f5f7] dark:bg-[#2c2c2c] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#2b2b2b] focus:outline-none focus:border-[#0078d4] dark:focus:border-[#60cdff] shadow-2xs placeholder-[#71717a] dark:placeholder-[#929292] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Clean Functional Theme Switcher (Icon Only) */}
      <div className="flex items-center justify-end gap-2 min-w-[140px] sm:min-w-[180px]">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/10 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-colors cursor-pointer active:scale-95"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
};
