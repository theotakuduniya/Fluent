import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus, Sparkles, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string) => void;
  existingCategories?: string[];
}

const PRESET_SUGGESTIONS = [
  'AI & ML',
  'Finance',
  'Social',
  'News',
  'Research',
  'Entertainment',
  'Cloud & DevOps',
  'Reference',
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  existingCategories = [],
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a category name');
      return;
    }

    const normalizedLower = trimmed.toLowerCase();
    if (
      existingCategories.some((c) => c.toLowerCase() === normalizedLower)
    ) {
      setError('A category with this name already exists');
      return;
    }

    onAddCategory(trimmed);
    onClose();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative w-full max-w-md bg-white/95 dark:bg-[#202020]/95 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.08] dark:border-white/[0.08] bg-[#f8f9fa]/80 dark:bg-[#252525]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 text-[#6366f1] dark:text-[#a5b4fc] flex items-center justify-center">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                    Add Category
                  </h2>
                  <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa]">
                    Create a new collection for your bookmarks
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3f3f46] dark:text-[#d4d4d8] mb-1.5">
                  Category Name
                </label>
                <div className="relative">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a] dark:text-[#a1a1aa]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Artificial Intelligence, Research, Tech News"
                    className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-white dark:bg-[#2a2a2a] text-[#18181b] dark:text-[#f4f4f5] focus:outline-hidden transition-all ${
                      error
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-black/15 dark:border-white/15 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20'
                    }`}
                  />
                </div>
                {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
              </div>

              {/* Suggestions */}
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#71717a] dark:text-[#a1a1aa] mb-2 font-medium">
                  <Sparkles className="w-3 h-3 text-[#6366f1] dark:text-[#a5b4fc]" />
                  <span>Suggestions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SUGGESTIONS.filter(
                    (s) => !existingCategories.some((c) => c.toLowerCase() === s.toLowerCase())
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 hover:bg-[#6366f1]/10 hover:text-[#6366f1] dark:hover:bg-[#6366f1]/20 dark:hover:text-[#a5b4fc] text-[#52525b] dark:text-[#d4d4d8] transition-colors cursor-pointer"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
