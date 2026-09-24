import React, { useState, useRef, useEffect } from 'react';
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

interface BookmarkTableViewProps {
  bookmarks: Bookmark[];
  selectedBookmarkIds: Set<string>;
  onToggleSelect: (bookmark: Bookmark, e: React.MouseEvent) => void;
  onToggleSelectAll: () => void;
  allSelected: boolean;
  onOpenUrl: (bookmark: Bookmark) => void;
  onToggleFavorite: (e: React.MouseEvent, bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmark: Bookmark) => void;
  onShowQR: (bookmark: Bookmark) => void;
}

export const BookmarkTableView: React.FC<BookmarkTableViewProps> = ({
  bookmarks,
  selectedBookmarkIds,
  onToggleSelect,
  onToggleSelectAll,
  allSelected,
  onOpenUrl,
  onToggleFavorite,
  onEdit,
  onDelete,
  onShowQR,
}) => {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const someSelected =
    selectedBookmarkIds.size > 0 && selectedBookmarkIds.size < bookmarks.length;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleCopyLink = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation();
    navigator.clipboard.writeText(bookmark.url);
    setCopiedId(bookmark.id);
    setTimeout(() => setCopiedId(null), 2000);
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
    <div className="w-full overflow-x-auto bg-white dark:bg-[#202020] rounded-xl border border-black/[0.08] dark:border-white/[0.08] shadow-xs select-none">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-black/[0.08] dark:border-white/[0.08] bg-[#f8f9fa] dark:bg-[#272727] text-[#71717a] dark:text-[#a1a1aa] font-medium h-9">
            <th className="w-10 px-3 text-center">
              <input
                ref={headerCheckboxRef}
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-[#0078d4] focus:ring-[#0078d4] cursor-pointer"
                title={allSelected ? 'Deselect all' : 'Select all'}
              />
            </th>
            <th className="w-8 px-1 text-center">
              <Star className="w-3.5 h-3.5 mx-auto opacity-70" />
            </th>
            <th className="py-2 px-3 font-semibold text-[#18181b] dark:text-[#f4f4f5]">
              Bookmark
            </th>
            <th className="py-2 px-3 font-semibold text-[#18181b] dark:text-[#f4f4f5]">
              Category
            </th>
            <th className="py-2 px-3 font-semibold text-[#18181b] dark:text-[#f4f4f5] hidden md:table-cell">
              Tags
            </th>
            <th className="py-2 px-3 font-semibold text-[#18181b] dark:text-[#f4f4f5] text-right pr-4 w-32">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          {bookmarks.map((bm) => {
            const isSelected = selectedBookmarkIds.has(bm.id);
            const domain = (() => {
              try {
                return new URL(bm.url).hostname.replace(/^www\./, '');
              } catch {
                return bm.url;
              }
            })();

            return (
              <tr
                key={bm.id}
                className={`group transition-colors h-11 ${
                  isSelected
                    ? 'bg-blue-50/40 dark:bg-blue-950/20'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                }`}
              >
                {/* Checkbox */}
                <td className="px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onToggleSelect(bm, e as any)}
                    className="w-4 h-4 rounded border-black/20 dark:border-white/20 text-[#0078d4] focus:ring-[#0078d4] cursor-pointer"
                  />
                </td>

                {/* Star Favorite */}
                <td className="px-1 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => onToggleFavorite(e, bm)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer mx-auto"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        bm.is_favorite === 1
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-[#a1a1aa] opacity-0 group-hover:opacity-100 hover:text-amber-500'
                      }`}
                    />
                  </button>
                </td>

                {/* Title & Favicon & URL */}
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#f4f5f7] dark:bg-[#2c2c2c] border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                      {bm.favicon ? (
                        <img
                          src={bm.favicon}
                          alt={bm.title}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-sm">
                      <div
                        onClick={() => onOpenUrl(bm)}
                        className="font-medium text-[#18181b] dark:text-[#f4f4f5] truncate cursor-pointer hover:text-[#0078d4] dark:hover:text-[#60cdff] transition-colors"
                      >
                        {bm.title}
                      </div>
                      <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate font-mono">
                        {domain}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-2 px-3">
                  <span
                    className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(
                      bm.category
                    )}`}
                  >
                    {bm.category}
                  </span>
                </td>

                {/* Tags */}
                <td className="py-2 px-3 hidden md:table-cell">
                  <div className="flex items-center gap-1 flex-wrap">
                    {bm.tags &&
                      bm.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-[#71717a] dark:text-[#a1a1aa] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md"
                        >
                          #{t}
                        </span>
                      ))}
                    {bm.tags && bm.tags.length > 2 && (
                      <span className="text-[10px] text-[#71717a] dark:text-[#a1a1aa]">
                        +{bm.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2 px-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onShowQR(bm)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleCopyLink(e, bm)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === bm.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => onEdit(bm)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDelete(bm)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-[#71717a] hover:text-red-500 dark:text-[#a1a1aa] dark:hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenUrl(bm)}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-[#0078d4] dark:text-[#60cdff] hover:bg-[#0078d4]/10 transition-colors cursor-pointer"
                      title="Open URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
