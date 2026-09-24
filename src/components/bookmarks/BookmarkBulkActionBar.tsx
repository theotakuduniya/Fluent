import React, { useState } from 'react';
import {
  Trash2,
  Star,
  FolderInput,
  Download,
  X,
  Check,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark } from '../../types/bookmark';

const CATEGORIES = [
  'Development',
  'Design',
  'Tools',
  'Reading',
  'Work',
  'Personal',
  'General',
];

interface BookmarkBulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  selectedBookmarks: Bookmark[];
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkMoveCategory: (category: string) => void;
  onBulkToggleFavorite: () => void;
  onExportSelected: () => void;
  availableCategories?: string[];
}

export const BookmarkBulkActionBar: React.FC<BookmarkBulkActionBarProps> = ({
  selectedCount,
  totalCount,
  selectedBookmarks,
  onClearSelection,
  onBulkDelete,
  onBulkMoveCategory,
  onBulkToggleFavorite,
  onExportSelected,
  availableCategories = [],
}) => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const categoriesList = React.useMemo(() => {
    const list = [...CATEGORIES];
    availableCategories.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [availableCategories]);

  if (selectedCount === 0) return null;

  const allSelectedAreFavorites =
    selectedBookmarks.length > 0 &&
    selectedBookmarks.every((bm) => bm.is_favorite === 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/95 dark:bg-[#2c2c2c]/95 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl text-xs select-none">
          {/* Badge count */}
          <div className="flex items-center gap-2 pr-2 border-r border-black/10 dark:border-white/10">
            <span className="w-5 h-5 rounded-full bg-[#6366f1] text-white flex items-center justify-center text-[11px] font-bold">
              {selectedCount}
            </span>
            <span className="font-semibold text-[#18181b] dark:text-[#f4f4f5] hidden sm:inline">
              Selected
            </span>
          </div>

          {/* Move to Category Popover */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer font-medium"
            >
              <FolderInput className="w-3.5 h-3.5 text-[#6366f1]" />
              <span className="hidden sm:inline">Move</span>
              <ChevronUp
                className={`w-3 h-3 transition-transform ${
                  showCategoryMenu ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showCategoryMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryMenu(false)}
                />
                <div className="absolute bottom-full mb-2 left-0 w-44 bg-white dark:bg-[#252525] rounded-xl border border-black/10 dark:border-white/10 shadow-xl py-1 z-20 overflow-hidden">
                  <div className="px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#71717a] dark:text-[#a1a1aa]">
                    Move to Category
                  </div>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onBulkMoveCategory(cat);
                        setShowCategoryMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-black/5 dark:hover:bg-white/5 text-[#18181b] dark:text-[#f4f4f5] transition-colors cursor-pointer"
                    >
                      <Check className="w-3 h-3 text-[#6366f1] opacity-0" />
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={onBulkToggleFavorite}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer font-medium"
            title={
              allSelectedAreFavorites
                ? 'Remove all from favorites'
                : 'Mark all as favorite'
            }
          >
            <Star
              className={`w-3.5 h-3.5 ${
                allSelectedAreFavorites
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-amber-500'
              }`}
            />
            <span className="hidden sm:inline">
              {allSelectedAreFavorites ? 'Unfavorite' : 'Favorite'}
            </span>
          </button>

          {/* Export Selected */}
          <button
            onClick={onExportSelected}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#18181b] dark:text-[#f4f4f5] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer font-medium"
            title="Export selected bookmarks as JSON"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Delete Selected */}
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer font-medium"
            title="Delete selected bookmarks"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Close / Deselect */}
          <button
            onClick={onClearSelection}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ml-1"
            title="Deselect all (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
