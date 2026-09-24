import React, { useState } from 'react';
import {
  Globe,
  Star,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Bookmark } from '../../types/bookmark';
import { motion } from 'motion/react';

interface BookmarkCardProps {
  bookmark: Bookmark;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  onOpenUrl: (bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onToggleFavorite: (e: React.MouseEvent, bookmark: Bookmark) => void;
  onShowQR: (bookmark: Bookmark) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  isSelected = false,
  onToggleSelect,
  onOpenUrl,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShowQR,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Extract domain for display
  const domain = React.useMemo(() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, '');
    } catch {
      return bookmark.url;
    }
  }, [bookmark.url]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bookmark.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'development':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'design':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'tools':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'reading':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'work':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={`group relative bg-white dark:bg-[#252525] rounded-xl border p-4 flex flex-col justify-between transition-all duration-150 select-none shadow-xs hover:shadow-md text-left ${
        isSelected
          ? 'border-[#0078d4] ring-2 ring-[#0078d4]/30 bg-blue-50/20 dark:bg-[#2c3238]'
          : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20'
      }`}
    >
      {/* Top Section */}
      <div className="w-full text-left">
        <div className="flex items-start justify-between gap-3 text-left">
          {/* Favicon & Title Info - positioned flush to the left */}
          <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
            {/* Favicon or Fallback Icon at far left */}
            <div className="w-8 h-8 rounded-lg bg-[#f4f5f7] dark:bg-[#303030] border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {bookmark.favicon && !imgError ? (
                <img
                  src={bookmark.favicon}
                  alt={bookmark.title}
                  className="w-5 h-5 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Globe className="w-4 h-4 text-[#71717a] dark:text-[#a1a1aa]" />
              )}
            </div>

            {/* Title and Domain */}
            <div className="flex-1 min-w-0 text-left">
              <h3
                onClick={() => onOpenUrl(bookmark)}
                className="text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] truncate cursor-pointer hover:text-[#0078d4] dark:hover:text-[#60cdff] transition-colors text-left"
                title={bookmark.title}
              >
                {bookmark.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 text-left">
                <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate font-mono text-left">
                  {domain}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Multi-select Checkbox & Star Favorite */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Multi-select checkbox */}
            <div
              onClick={onToggleSelect}
              className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#0078d4] text-white shadow-2xs'
                  : 'border border-black/20 dark:border-white/20 hover:border-[#0078d4] dark:hover:border-[#60cdff] opacity-0 group-hover:opacity-100 bg-black/5 dark:bg-white/5'
              }`}
              title={isSelected ? 'Deselect bookmark' : 'Select bookmark'}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            {/* Star Favorite Button */}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(e, bookmark)}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                bookmark.is_favorite === 1
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  : 'text-[#a1a1aa] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100'
              }`}
              title={bookmark.is_favorite === 1 ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  bookmark.is_favorite === 1 ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Description - justified left */}
        {bookmark.description && (
          <p className="mt-2.5 text-xs text-[#52525b] dark:text-[#d4d4d8] line-clamp-2 leading-relaxed text-left">
            {bookmark.description}
          </p>
        )}

        {/* Tags & Category Badge - justified left */}
        <div className="mt-3 flex flex-wrap items-center justify-start gap-1.5 text-left">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
              bookmark.category
            )}`}
          >
            {bookmark.category}
          </span>

          {bookmark.tags &&
            bookmark.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
              >
                #{tag}
              </span>
            ))}
          {bookmark.tags && bookmark.tags.length > 3 && (
            <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
              +{bookmark.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions Bar - justified left, visits counted in background but not shown */}
      <div className="mt-3.5 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-start gap-1 w-full text-left">
        {/* Open in new tab button */}
        <button
          onClick={() => onOpenUrl(bookmark)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#0078d4] dark:text-[#60cdff] bg-[#0078d4]/10 dark:bg-[#60cdff]/10 hover:bg-[#0078d4]/20 dark:hover:bg-[#60cdff]/20 transition-colors cursor-pointer mr-0.5"
          title="Open in new tab"
        >
          <span>Open</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* QR Code */}
        <button
          onClick={() => onShowQR(bookmark)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Scan QR Code on mobile"
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Copy URL"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Edit */}
        <button
          onClick={() => onEdit(bookmark)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Edit Bookmark"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(bookmark)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-red-500 dark:text-[#a1a1aa] dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          title="Delete Bookmark"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
