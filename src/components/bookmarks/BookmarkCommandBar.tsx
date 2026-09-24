import React, { useState, useRef } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  ArrowUpDown,
  Download,
  Upload,
  CheckSquare,
  Square,
  ChevronDown,
  Check,
} from 'lucide-react';
import { BookmarkSortField, BookmarkViewMode } from '../../types/bookmark';

interface BookmarkCommandBarProps {
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  viewMode: BookmarkViewMode;
  onViewModeChange: (mode: BookmarkViewMode) => void;
  sortField: BookmarkSortField;
  onSortFieldChange: (field: BookmarkSortField) => void;
  onNewBookmark: () => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onExport: () => void;
  onImport: () => void;
}

const SORT_OPTIONS: { id: BookmarkSortField; label: string }[] = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'popular', label: 'Most Visited' },
  { id: 'title_asc', label: 'Title (A-Z)' },
  { id: 'title_desc', label: 'Title (Z-A)' },
  { id: 'category', label: 'Category' },
];

export const BookmarkCommandBar: React.FC<BookmarkCommandBarProps> = ({
  totalCount,
  filteredCount,
  selectedCount,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  onNewBookmark,
  onToggleSelectAll,
  allSelected,
  onExport,
  onImport,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortField)?.label || 'Sort';

  return (
    <div className="h-12 bg-white dark:bg-[#202020] border-b border-black/[0.08] dark:border-white/[0.08] px-3 sm:px-4 flex items-center justify-between gap-2 select-none shrink-0 transition-colors">
      {/* Left side actions: New bookmark & Select All */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onNewBookmark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Bookmark</span>
        </button>

        {/* Win11 vertical separator */}
        <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Select all button */}
        <button
          onClick={onToggleSelectAll}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            allSelected
              ? 'bg-[#6366f1]/15 text-[#6366f1] dark:text-[#a5b4fc]'
              : 'text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={allSelected ? 'Deselect all' : 'Select all (Ctrl+A)'}
        >
          {allSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-[#6366f1]" />
          ) : (
            <Square className="w-3.5 h-3.5 opacity-60" />
          )}
          <span className="hidden sm:inline">
            {allSelected ? 'All Selected' : 'Select All'}
          </span>
        </button>
      </div>

      {/* Right side controls: Sort, View Mode, Import, Export, Counter */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sort Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <ChevronDown className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa]" />
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#282828] rounded-xl border border-black/10 dark:border-white/10 shadow-xl py-1 z-30 overflow-hidden">
                <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#71717a] dark:text-[#a1a1aa]">
                  Sort By
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSortFieldChange(opt.id);
                      setShowSortMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      sortField === opt.id
                        ? 'bg-[#6366f1]/10 text-[#6366f1] dark:text-[#a5b4fc] font-semibold'
                        : 'text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortField === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* View Mode Toggle: Grid vs Table */}
        <div className="flex items-center bg-[#f4f5f7] dark:bg-[#2c2c2c] p-0.5 rounded-lg border border-black/5 dark:border-white/5">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#383838] text-[#18181b] dark:text-white shadow-2xs'
                : 'text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white'
            }`}
            title="Grid Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#383838] text-[#18181b] dark:text-white shadow-2xs'
                : 'text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Win11 vertical separator */}
        <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-0.5 hidden md:block" />

        {/* Import & Export */}
        <button
          onClick={onImport}
          className="w-7 h-7 hidden md:flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Import Bookmarks JSON"
        >
          <Upload className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onExport}
          className="w-7 h-7 hidden md:flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Export All Bookmarks JSON"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        {/* Count indicator */}
        <div className="text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa] pl-1.5 tabular-nums">
          {filteredCount === totalCount ? (
            <span>{totalCount} items</span>
          ) : (
            <span>{filteredCount}/{totalCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};
