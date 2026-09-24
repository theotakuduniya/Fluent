import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Star,
  FolderInput,
  Download,
  X,
  Check,
  ChevronDown,
  Briefcase,
  Heart,
  Smile,
  ShieldCheck,
  Building,
  User,
  CheckSquare,
} from 'lucide-react';
import { Contact } from '../../types/contact';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: 'Work', label: 'Work', icon: Briefcase },
  { id: 'Personal', label: 'Personal', icon: User },
  { id: 'Family', label: 'Family', icon: Heart },
  { id: 'Friends', label: 'Friends', icon: Smile },
  { id: 'VIP', label: 'VIP', icon: ShieldCheck },
  { id: 'Clients', label: 'Clients', icon: Building },
];

interface BulkActionBarProps {
  selectedCount: number;
  totalVisibleCount: number;
  allSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkMoveCategory: (category: string) => void;
  onBulkToggleFavorite: () => void;
  areAllFavorites: boolean;
  onBulkExport: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalVisibleCount,
  allSelected,
  onToggleSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkMoveCategory,
  onBulkToggleFavorite,
  areAllFavorites,
  onBulkExport,
}) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Close category menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    }
    if (isCategoryMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isCategoryMenuOpen]);

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: [0.1, 0.9, 0.2, 1.0] }}
      className="bg-[#eef3f8] dark:bg-[#282d34] border-b border-[#0078d4]/30 dark:border-[#60cdff]/30 px-3 py-2 flex items-center justify-between gap-3 text-xs select-none shadow-xs shrink-0 z-20"
    >
      {/* Left section: selection summary & select all toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <label
          className="flex items-center gap-2 cursor-pointer font-medium text-[#18181b] dark:text-[#f4f4f5] px-1 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={allSelected ? 'Deselect all contacts' : 'Select all visible contacts'}
        >
          <div
            onClick={(e) => {
              e.preventDefault();
              onToggleSelectAll();
            }}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
              allSelected
                ? 'bg-[#0078d4] border-[#0078d4] text-white shadow-2xs'
                : 'bg-white dark:bg-[#383838] border-black/30 dark:border-white/30 text-transparent'
            }`}
          >
            {allSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 bg-[#0078d4] rounded-xs" />}
          </div>
          <span className="font-semibold text-[#0078d4] dark:text-[#60cdff]">
            {selectedCount} <span className="font-normal text-[#52525b] dark:text-[#d4d4d8]">of {totalVisibleCount} selected</span>
          </span>
        </label>

        <button
          onClick={onToggleSelectAll}
          className="hidden sm:inline-flex text-[11px] font-medium text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white transition-colors underline underline-offset-2"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Right section: bulk action buttons */}
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {/* Move to Category Dropdown */}
        <div className="relative" ref={categoryMenuRef}>
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 font-medium rounded-md border transition-all shadow-2xs ${
              isCategoryMenuOpen
                ? 'bg-[#0078d4] text-white border-[#0078d4]'
                : 'bg-white dark:bg-[#333] border-black/10 dark:border-white/10 text-[#18181b] dark:text-[#f4f4f5] hover:bg-[#f4f5f7] dark:hover:bg-[#3a3a3a]'
            }`}
            title="Move selected contacts to a category"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span>Move to</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Category Dropdown Menu */}
          <AnimatePresence>
            {isCategoryMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-48 bg-white dark:bg-[#2c2c2c] rounded-lg shadow-xl border border-black/10 dark:border-white/10 py-1.5 z-50 overflow-hidden"
              >
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
                  Select Target Category
                </div>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onBulkMoveCategory(cat.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left text-[#18181b] dark:text-[#f4f4f5] hover:bg-[#0078d4]/10 dark:hover:bg-[#60cdff]/15 hover:text-[#0078d4] dark:hover:text-[#60cdff] transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Favorite / Unfavorite */}
        <button
          onClick={onBulkToggleFavorite}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 font-medium rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#333] transition-colors ${
            areAllFavorites
              ? 'text-amber-500 hover:bg-amber-500/10'
              : 'text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={areAllFavorites ? 'Remove selected from favorites' : 'Add selected to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${areAllFavorites ? 'fill-amber-500' : ''}`} />
          <span className="hidden sm:inline">{areAllFavorites ? 'Unfavorite' : 'Favorite'}</span>
        </button>

        {/* Export selected contacts */}
        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 font-medium rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#333] text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Export selected contacts to .vcf format"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Bulk Delete */}
        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-all shadow-xs active:scale-95"
          title="Delete selected contacts"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete ({selectedCount})</span>
        </button>

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          className="p-1.5 rounded-md text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Clear selection (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
