import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ToastNotice {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface InfoBarProps {
  notices: ToastNotice[];
  onDismiss: (id: string) => void;
}

export const InfoBar: React.FC<InfoBarProps> = ({ notices, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      <AnimatePresence>
        {notices.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto p-3 rounded-lg shadow-lg border win-acrylic flex items-center gap-3 win-card-surface"
          >
            {n.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {n.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            {n.type === 'info' && (
              <Info className="w-4 h-4 text-[#0078d4] dark:text-[#60cdff] shrink-0" />
            )}

            <span className="text-xs text-[#1c1c1c] dark:text-[#f3f3f3] font-medium flex-1">
              {n.message}
            </span>

            <button
              onClick={() => onDismiss(n.id)}
              className="p-1 rounded text-[#777] hover:text-[#111] dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
