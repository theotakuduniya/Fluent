import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteDialogProps {
  isOpen: boolean;
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  contactName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18, ease: [0.1, 0.9, 0.2, 1.0] }}
          className="w-full max-w-sm bg-white dark:bg-[#2c2c2c] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#18181b] dark:text-[#f4f4f5]">
                  Delete contact?
                </h3>
                <p className="text-xs text-[#52525b] dark:text-[#a1a1aa] mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-[#18181b] dark:text-white">"{contactName}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 bg-[#fbfbfb] dark:bg-[#242424] border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-all shadow-xs active:scale-95"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
