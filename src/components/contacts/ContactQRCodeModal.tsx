import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { Contact } from '../../types/contact';
import { generateVCard } from '../../utils/vcard';

interface ContactQRCodeModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContactQRCodeModal: React.FC<ContactQRCodeModalProps> = ({
  contact,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  // Generate standard vCard 3.0 for instant mobile scanning
  const qrPayload = React.useMemo(() => {
    if (!contact) return '';
    return generateVCard(contact);
  }, [contact]);

  // Render QR Code onto canvas
  useEffect(() => {
    if (!isOpen || !contact || !canvasRef.current || !qrPayload) return;

    QRCode.toCanvas(canvasRef.current, qrPayload, {
      width: 200,
      margin: 2,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    }).catch((err) => {
      console.error('Failed to generate QR code canvas', err);
    });
  }, [isOpen, contact, qrPayload]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contact) return null;

  const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase() || 'U';

  const handleCopy = async () => {
    try {
      if (canvasRef.current) {
        canvasRef.current.toBlob(async (blob) => {
          if (blob && navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              return;
            } catch {
              // fallback to text copy
            }
          }
          await navigator.clipboard.writeText(qrPayload);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }, 'image/png');
      } else {
        await navigator.clipboard.writeText(qrPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;

    const exportCanvas = document.createElement('canvas');
    const qrWidth = canvasRef.current.width;
    const qrHeight = canvasRef.current.height;
    const padding = 28;
    const footerHeight = 64;

    exportCanvas.width = qrWidth + padding * 2;
    exportCanvas.height = qrHeight + padding * 2 + footerHeight;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(canvasRef.current, padding, padding, qrWidth, qrHeight);

    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 16px "Segoe UI", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(contact.display_name, exportCanvas.width / 2, qrHeight + padding + 26);

    ctx.fillStyle = '#71717a';
    ctx.font = '12px "Segoe UI", -apple-system, sans-serif';
    const subtitle = [contact.job_title, contact.company || contact.phone].filter(Boolean).join(' · ');
    ctx.fillText(subtitle || 'Scan to save contact', exportCanvas.width / 2, qrHeight + padding + 46);

    const url = exportCanvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    const safeName = (contact.display_name || 'contact').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    anchor.href = url;
    anchor.download = `${safeName}_qr.png`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="w-full max-w-[320px] bg-white dark:bg-[#242424] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 p-5 flex flex-col items-center relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* QR Code Container */}
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-zinc-200/80 dark:border-zinc-700/60 relative mt-1">
            <canvas ref={canvasRef} className="block w-[200px] h-[200px] rounded-lg" />

            {/* Center Avatar Badge */}
            <div
              style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
              className="absolute inset-0 m-auto w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white pointer-events-none"
            >
              {initials}
            </div>
          </div>

          {/* Mini Contact Card */}
          <div className="mt-3.5 w-full bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.08] rounded-xl p-3 flex items-center gap-3">
            {contact.avatar_url ? (
              <img
                src={contact.avatar_url}
                alt={contact.display_name}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/10"
              />
            ) : (
              <div
                style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
              >
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-[#18181b] dark:text-[#f4f4f5] truncate">
                {contact.display_name}
              </h3>
              {(contact.job_title || contact.company) && (
                <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate leading-tight">
                  {[contact.job_title, contact.company].filter(Boolean).join(' · ')}
                </p>
              )}
              {contact.phone && (
                <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate mt-0.5 leading-tight">
                  {contact.phone}
                </p>
              )}
              {!contact.phone && contact.email && (
                <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate mt-0.5 leading-tight">
                  {contact.email}
                </p>
              )}
            </div>
          </div>

          {/* Minimal Actions */}
          <div className="mt-3.5 flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors shadow-xs active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#2d2d2d] text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-98"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
