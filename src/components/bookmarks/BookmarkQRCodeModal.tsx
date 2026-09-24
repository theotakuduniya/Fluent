import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark } from '../../types/bookmark';

interface BookmarkQRCodeModalProps {
  bookmark: Bookmark | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkQRCodeModal: React.FC<BookmarkQRCodeModalProps> = ({
  bookmark,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !bookmark || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      bookmark.url,
      {
        width: 192,
        margin: 1.5,
        color: {
          dark: '#1e1e1e',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('Failed to generate QR code', error);
      }
    );
  }, [isOpen, bookmark]);

  const handleCopyUrl = async () => {
    if (!bookmark) return;
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current || !bookmark) return;
    const link = document.createElement('a');
    link.download = `${bookmark.title.replace(/[^a-zA-Z0-9]/g, '_')}_qr.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && bookmark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Acrylic / Mica Backdrop */}
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
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-sm bg-white dark:bg-[#2b2b2b] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5 bg-[#fbfbfb] dark:bg-[#323232]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                  Scan Bookmark URL
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Content */}
            <div className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-white rounded-xl shadow-inner border border-black/10 flex items-center justify-center">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>

              <div className="mt-4 w-full">
                <h4 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5] truncate">
                  {bookmark.title}
                </h4>
                <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] truncate mt-0.5 max-w-[260px] mx-auto">
                  {bookmark.url}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 w-full">
                <button
                  onClick={handleCopyUrl}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md border border-black/10 dark:border-white/10 bg-[#fbfbfb] dark:bg-[#323232] hover:bg-[#f4f4f5] dark:hover:bg-[#383838] text-[#18181b] dark:text-[#f4f4f5] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium rounded-md bg-[#0078d4] hover:bg-[#106ebe] text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save QR</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
