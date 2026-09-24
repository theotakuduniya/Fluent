import React from 'react';
import { Search, Sun, Moon, Database, X, Minus, Square, Users } from 'lucide-react';

interface TitleBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenSqlConsole: () => void;
  contactCount: number;
  dbByteSize: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onOpenSqlConsole,
  contactCount,
  dbByteSize,
}) => {
  const formatKb = (bytes: number) => {
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <header className="h-11 win-mica flex items-center justify-between px-3 border-b win-border-subtle select-none z-30 shrink-0">
      {/* Zone 1: Brand & Window Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md bg-[#0078d4] text-white flex items-center justify-center shadow-xs">
          <Users className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold tracking-tight text-[#1c1c1c] dark:text-[#f3f3f3]">
          Fluent Contacts
        </span>
      </div>

      {/* Zone 2: Windows 11 Center Search Box */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#767676] dark:text-[#a0a0a0] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts, phones, or companies..."
            className="w-full h-7 pl-8 pr-7 text-xs bg-white dark:bg-[#2b2b2b] text-[#1c1c1c] dark:text-[#f3f3f3] border border-black/10 dark:border-white/10 rounded-md focus:outline-none focus:border-[#0078d4] dark:focus:border-[#60cdff] shadow-2xs placeholder-[#767676] dark:placeholder-[#929292] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-[#767676] hover:text-[#1c1c1c] dark:text-[#a0a0a0] dark:hover:text-white p-0.5"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: SQLite Status, Theme Switch & Windows Control Buttons */}
      <div className="flex items-center gap-1.5">
        {/* SQLite status trigger */}
        <button
          onClick={onOpenSqlConsole}
          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium rounded-md text-[#404040] dark:text-[#d0d0d0] hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-colors"
          title="Open SQLite Database Console"
        >
          <Database className="w-3 h-3 text-[#0078d4] dark:text-[#60cdff]" />
          <span className="font-mono tabular-nums">{contactCount}</span>
          <span className="text-[#888888] dark:text-[#888888] font-mono text-[10px]">
            ({formatKb(dbByteSize)})
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#505050] dark:text-[#d0d0d0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={darkMode ? 'Switch to Windows Light Mode' : 'Switch to Windows Dark Mode'}
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Windows 11 Window Caption Controls (decorative/interactive mock) */}
        <div className="flex items-center -mr-1 ml-1">
          <button
            className="w-8 h-7 flex items-center justify-center text-[#555] dark:text-[#bbb] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center text-[#555] dark:text-[#bbb] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Maximize"
          >
            <Square className="w-2.5 h-2.5" />
          </button>
          <button
            className="w-8 h-7 flex items-center justify-center text-[#555] dark:text-[#bbb] hover:bg-[#e81123] hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
};
