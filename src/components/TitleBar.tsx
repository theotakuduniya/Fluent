import React, { useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  X,
  Users,
  Bookmark as BookmarkIcon,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';

interface TitleBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeModule?: 'contacts' | 'bookmarks';
  onSelectModule?: (module: 'contacts' | 'bookmarks') => void;
  contactCount?: number;
  bookmarkCount?: number;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  activeModule = 'contacts',
  onSelectModule,
  contactCount = 0,
  bookmarkCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isContacts = activeModule === 'contacts';

  return (
    <header className="h-11 bg-white dark:bg-[#202020] flex items-center justify-between px-3 border-b border-black/[0.08] dark:border-white/[0.08] select-none z-30 shrink-0 relative transition-colors duration-150">
      {/* Zone 1: Brand & Window Title with Bottom Dropdown beside Fluent Contacts */}
      <div className="flex items-center gap-1.5 min-w-[170px] sm:min-w-[220px] relative">
        <div className="flex items-center gap-2">
          {/* Module App Icon */}
          <div
            className={`w-6 h-6 rounded-md text-white flex items-center justify-center shadow-xs transition-colors ${
              isContacts ? 'bg-[#0078d4]' : 'bg-[#6366f1]'
            }`}
          >
            {isContacts ? (
              <Users className="w-3.5 h-3.5" />
            ) : (
              <BookmarkIcon className="w-3.5 h-3.5" />
            )}
          </div>

          {/* Module Name */}
          <span className="text-xs font-semibold tracking-tight text-[#18181b] dark:text-[#f4f4f5]">
            {isContacts ? 'Fluent Contacts' : 'Fluent Bookmarks'}
          </span>
        </div>

        {/* Bottom Dropdown Trigger Button placed right beside Fluent Contacts */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
              dropdownOpen
                ? 'bg-black/10 dark:bg-white/10 text-[#18181b] dark:text-white'
                : 'text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#18181b] dark:hover:text-white'
            }`}
            title="Switch between Fluent Contacts and Fluent Bookmarks"
            aria-expanded={dropdownOpen}
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-150 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Bottom Dropdown Flyout */}
          {dropdownOpen && (
            <>
              {/* Invisible dismiss backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />

              {/* Flyout panel */}
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-white/95 dark:bg-[#282828]/95 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#71717a] dark:text-[#a1a1aa] uppercase">
                  Switch Workspace
                </div>

                <div className="space-y-1 mt-0.5">
                  {/* Option 1: Fluent Contacts */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectModule) onSelectModule('contacts');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      isContacts
                        ? 'bg-[#0078d4]/10 dark:bg-[#0078d4]/20 border border-[#0078d4]/20 text-[#0078d4] dark:text-[#60cdff]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#18181b] dark:text-[#f4f4f5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-[#0078d4] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">
                          Fluent Contacts
                        </div>
                        <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] leading-tight mt-0.5">
                          Address book & vCards
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {contactCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[#71717a] dark:text-[#a1a1aa]">
                          {contactCount}
                        </span>
                      )}
                      {isContacts && <Check className="w-4 h-4 text-[#0078d4] dark:text-[#60cdff]" />}
                    </div>
                  </button>

                  {/* Option 2: Fluent Bookmarks */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectModule) onSelectModule('bookmarks');
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      !isContacts
                        ? 'bg-[#6366f1]/10 dark:bg-[#6366f1]/20 border border-[#6366f1]/20 text-[#6366f1] dark:text-[#a5b4fc]'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#18181b] dark:text-[#f4f4f5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <BookmarkIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold leading-tight">
                          Fluent Bookmarks
                        </div>
                        <div className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] leading-tight mt-0.5">
                          Web links & collections
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {bookmarkCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[#71717a] dark:text-[#a1a1aa]">
                          {bookmarkCount}
                        </span>
                      )}
                      {!isContacts && <Check className="w-4 h-4 text-[#6366f1] dark:text-[#a5b4fc]" />}
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
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
            placeholder={
              isContacts
                ? 'Search contacts, phones, companies...'
                : 'Search bookmarks, URLs, tags...'
            }
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

      {/* Zone 3: Clean Functional Theme Switcher */}
      <div className="flex items-center justify-end gap-2 min-w-[170px] sm:min-w-[220px]">
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
