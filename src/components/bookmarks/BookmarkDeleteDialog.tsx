import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookmarkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemCount?: number;
}

export const BookmarkDeleteDialog: React.FC<BookmarkDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemCount = 1,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-sm bg-white dark:bg-[#2b2b2b] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden z-10 p-5 flex flex-col"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                  {itemCount > 1 ? `Delete ${itemCount} Bookmarks?` : 'Delete Bookmark?'}
                </h3>
                <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-1 leading-relaxed">
                  {itemCount > 1 ? (
                    <>Are you sure you want to delete these {itemCount} bookmarks? This will permanently remove them from your SQLite database.</>
                  ) : (
                    <>Are you sure you want to delete <span className="font-semibold text-[#18181b] dark:text-white">"{title}"</span>? This action cannot be undone.</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-black/5 dark:border-white/5">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-black/10 dark:border-white/10 bg-[#fbfbfb] dark:bg-[#323232] hover:bg-[#f4f4f5] dark:hover:bg-[#383838] text-[#18181b] dark:text-[#f4f4f5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
