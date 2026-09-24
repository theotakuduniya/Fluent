import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bookmark as BookmarkIcon,
  Search,
  Plus,
  Folder,
  Tag,
  Star,
  ExternalLink,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { Bookmark, BookmarkSortField, BookmarkViewMode } from '../../types/bookmark';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  bulkDeleteBookmarks,
  bulkUpdateBookmarkCategory,
  bulkToggleBookmarkFavorite,
  toggleBookmarkFavorite,
  incrementBookmarkClick,
} from '../../services/db';
import { BookmarkCard } from './BookmarkCard';
import { BookmarkTableView } from './BookmarkTableView';
import { BookmarkCommandBar } from './BookmarkCommandBar';
import { BookmarkFormModal } from './BookmarkFormModal';
import { BookmarkDeleteDialog } from './BookmarkDeleteDialog';
import { BookmarkBulkActionBar } from './BookmarkBulkActionBar';
import { BookmarkQRCodeModal } from './BookmarkQRCodeModal';
import { AddCategoryModal } from './AddCategoryModal';

interface BookmarkModuleProps {
  searchQuery: string;
  activeCategory: string;
  onCategorySelect?: (cat: string) => void;
  onShowInfoBar?: (message: string, type?: 'success' | 'info' | 'error') => void;
  customCategories?: string[];
  onAddCategory?: (category: string) => void;
}

export const BookmarkModule: React.FC<BookmarkModuleProps> = ({
  searchQuery,
  activeCategory,
  onCategorySelect,
  onShowInfoBar,
  customCategories = [],
  onAddCategory,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<BookmarkViewMode>('grid');
  const [sortField, setSortField] = useState<BookmarkSortField>('recent');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Multi-selection state
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [deletingBookmark, setDeletingBookmark] = useState<Bookmark | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [qrBookmark, setQrBookmark] = useState<Bookmark | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load bookmarks from SQLite
  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await getBookmarks({
        category: activeCategory,
        searchQuery,
        sortField,
        tag: selectedTag || undefined,
      });
      setBookmarks(data);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [activeCategory, searchQuery, sortField, selectedTag]);

  // Clean selection if bookmarks change
  useEffect(() => {
    setSelectedBookmarkIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (bookmarks.some((b) => b.id === id)) {
          next.add(id);
        }
      }
      return next;
    });
  }, [bookmarks]);

  // Keyboard shortcut Ctrl+A and Esc and custom new-bookmark event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setSelectedBookmarkIds(new Set(bookmarks.map((b) => b.id)));
      } else if (e.key === 'Escape') {
        setSelectedBookmarkIds(new Set());
      }
    };

    const handleExternalNew = () => {
      setEditingBookmark(null);
      setIsFormOpen(true);
    };

    const handleExternalAddCategory = () => {
      setIsAddCategoryOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('fluent:new-bookmark', handleExternalNew);
    window.addEventListener('fluent:add-category', handleExternalAddCategory);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('fluent:new-bookmark', handleExternalNew);
      window.removeEventListener('fluent:add-category', handleExternalAddCategory);
    };
  }, [bookmarks]);

  // Handlers
  const handleOpenUrl = async (bookmark: Bookmark) => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    try {
      await incrementBookmarkClick(bookmark.id);
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === bookmark.id ? { ...b, click_count: b.click_count + 1 } : b
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, bookmark: Bookmark) => {
    e.stopPropagation();
    try {
      const next = await toggleBookmarkFavorite(bookmark.id, bookmark.is_favorite);
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmark.id ? { ...b, is_favorite: next } : b))
      );
      if (onShowInfoBar) {
        onShowInfoBar(
          next ? `Added "${bookmark.title}" to favorites` : `Removed "${bookmark.title}" from favorites`,
          'success'
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBookmark = async (
    data: Omit<Bookmark, 'id' | 'created_at' | 'updated_at' | 'click_count'>
  ) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, data);
      if (onShowInfoBar) onShowInfoBar(`Updated bookmark "${data.title}"`, 'success');
    } else {
      await createBookmark(data);
      if (onShowInfoBar) onShowInfoBar(`Created bookmark "${data.title}"`, 'success');
    }
    loadBookmarks();
  };

  const handleConfirmDelete = async () => {
    if (isBulkDeleting) {
      const ids = Array.from(selectedBookmarkIds);
      await bulkDeleteBookmarks(ids);
      setSelectedBookmarkIds(new Set());
      setIsBulkDeleting(false);
      if (onShowInfoBar) onShowInfoBar(`Deleted ${ids.length} bookmarks`, 'info');
    } else if (deletingBookmark) {
      await deleteBookmark(deletingBookmark.id);
      if (onShowInfoBar) onShowInfoBar(`Deleted bookmark "${deletingBookmark.title}"`, 'info');
      setDeletingBookmark(null);
    }
    loadBookmarks();
  };

  const handleBulkMoveCategory = async (category: string) => {
    const ids = Array.from(selectedBookmarkIds);
    await bulkUpdateBookmarkCategory(ids, category);
    setSelectedBookmarkIds(new Set());
    if (onShowInfoBar) {
      onShowInfoBar(`Moved ${ids.length} bookmarks to ${category}`, 'success');
    }
    loadBookmarks();
  };

  const handleBulkToggleFavorite = async () => {
    const ids = Array.from(selectedBookmarkIds);
    const selectedList = bookmarks.filter((b) => selectedBookmarkIds.has(b.id));
    const allAreFavorites = selectedList.every((b) => b.is_favorite === 1);
    const targetState = !allAreFavorites;

    await bulkToggleBookmarkFavorite(ids, targetState);
    if (onShowInfoBar) {
      onShowInfoBar(
        targetState
          ? `Marked ${ids.length} bookmarks as favorite`
          : `Removed ${ids.length} bookmarks from favorites`,
        'success'
      );
    }
    loadBookmarks();
  };

  const handleToggleSelectOne = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookmarkIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmark.id)) {
        next.delete(bookmark.id);
      } else {
        next.add(bookmark.id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedBookmarkIds.size === bookmarks.length && bookmarks.length > 0) {
      setSelectedBookmarkIds(new Set());
    } else {
      setSelectedBookmarkIds(new Set(bookmarks.map((b) => b.id)));
    }
  };

  // Export Bookmarks as JSON
  const handleExportJson = (listToExport = bookmarks) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(listToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fluent_bookmarks_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onShowInfoBar) {
      onShowInfoBar(`Exported ${listToExport.length} bookmarks`, 'success');
    }
  };

  // Import Bookmarks from JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        let imported = 0;
        for (const item of items) {
          if (item.title && item.url) {
            await createBookmark({
              title: item.title,
              url: item.url,
              description: item.description || '',
              category: item.category || 'General',
              tags: Array.isArray(item.tags) ? item.tags : [],
              favicon: item.favicon || '',
              is_favorite: item.is_favorite ? 1 : 0,
            });
            imported++;
          }
        }
        loadBookmarks();
        if (onShowInfoBar) {
          onShowInfoBar(`Successfully imported ${imported} bookmarks`, 'success');
        }
      } catch (err) {
        console.error('Failed to import bookmarks', err);
        if (onShowInfoBar) {
          onShowInfoBar('Error parsing bookmark JSON file', 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Extract all distinct tags from current bookmarks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.tags) {
        b.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [bookmarks]);

  const selectedBookmarksList = useMemo(() => {
    return bookmarks.filter((b) => selectedBookmarkIds.has(b.id));
  }, [bookmarks, selectedBookmarkIds]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-[#1a1a1a] transition-colors relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        className="hidden"
      />

      {/* Command Bar */}
      <BookmarkCommandBar
        totalCount={bookmarks.length}
        filteredCount={bookmarks.length}
        selectedCount={selectedBookmarkIds.size}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortField={sortField}
        onSortFieldChange={setSortField}
        onNewBookmark={() => {
          setEditingBookmark(null);
          setIsFormOpen(true);
        }}
        onToggleSelectAll={handleToggleSelectAll}
        allSelected={selectedBookmarkIds.size === bookmarks.length && bookmarks.length > 0}
        onExport={() => handleExportJson(bookmarks)}
        onImport={() => fileInputRef.current?.click()}
      />

      {/* Tags Filter Strip if tags exist */}
      {allTags.length > 0 && (
        <div className="px-4 py-2 bg-white dark:bg-[#202020] border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-1.5 overflow-x-auto select-none shrink-0 no-scrollbar">
          <span className="text-[11px] font-semibold text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3" />
            <span>Filter Tags:</span>
          </span>

          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
              selectedTag === null
                ? 'bg-[#6366f1] text-white shadow-2xs'
                : 'bg-black/5 dark:bg-white/5 text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/10 dark:hover:bg-white/10'
            }`}
          >
            All Tags
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#6366f1] text-white shadow-2xs'
                  : 'bg-black/5 dark:bg-white/5 text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              #{tag}
            </button>
          ))}

          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-red-500 hover:underline ml-1 shrink-0 cursor-pointer"
            >
              Clear tag filter
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-xs text-[#71717a] dark:text-[#a1a1aa]">
            <div className="w-6 h-6 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
            <span>Reading bookmarks from SQLite...</span>
          </div>
        ) : bookmarks.length === 0 ? (
          /* Win11 Empty State */
          <div className="h-96 flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6 rounded-2xl bg-white/50 dark:bg-[#252525]/50 border border-black/5 dark:border-white/5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#6366f1]/10 text-[#6366f1] dark:bg-[#818cf8]/20 dark:text-[#a5b4fc] flex items-center justify-center mb-4 shadow-inner">
              <BookmarkIcon className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
              No Bookmarks Found
            </h3>
            <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-1.5 leading-relaxed">
              {searchQuery
                ? `No bookmarks match "${searchQuery}". Try searching for another keyword or tag.`
                : activeCategory !== 'All'
                ? `No bookmarks saved in "${activeCategory}".`
                : 'Start organizing your favorite web links, developer tools, and articles.'}
            </p>
            <button
              onClick={() => {
                setEditingBookmark(null);
                setIsFormOpen(true);
              }}
              className="mt-5 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Bookmark</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {bookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                isSelected={selectedBookmarkIds.has(bm.id)}
                onToggleSelect={(e) => handleToggleSelectOne(bm, e)}
                onOpenUrl={handleOpenUrl}
                onEdit={(b) => {
                  setEditingBookmark(b);
                  setIsFormOpen(true);
                }}
                onDelete={(b) => setDeletingBookmark(b)}
                onToggleFavorite={handleToggleFavorite}
                onShowQR={(b) => setQrBookmark(b)}
              />
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="pb-20">
            <BookmarkTableView
              bookmarks={bookmarks}
              selectedBookmarkIds={selectedBookmarkIds}
              onToggleSelect={handleToggleSelectOne}
              onToggleSelectAll={handleToggleSelectAll}
              allSelected={selectedBookmarkIds.size === bookmarks.length && bookmarks.length > 0}
              onOpenUrl={handleOpenUrl}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(b) => {
                setEditingBookmark(b);
                setIsFormOpen(true);
              }}
              onDelete={(b) => setDeletingBookmark(b)}
              onShowQR={(b) => setQrBookmark(b)}
            />
          </div>
        )}
      </div>

      {/* Floating Win11 Bulk Actions Bar */}
      <BookmarkBulkActionBar
        selectedCount={selectedBookmarkIds.size}
        totalCount={bookmarks.length}
        selectedBookmarks={selectedBookmarksList}
        onClearSelection={() => setSelectedBookmarkIds(new Set())}
        onBulkDelete={() => setIsBulkDeleting(true)}
        onBulkMoveCategory={handleBulkMoveCategory}
        onBulkToggleFavorite={handleBulkToggleFavorite}
        onExportSelected={() => handleExportJson(selectedBookmarksList)}
        availableCategories={customCategories}
      />

      {/* Bookmark Form Modal */}
      <BookmarkFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        initialBookmark={editingBookmark}
        availableCategories={customCategories}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={(cat) => {
          if (onAddCategory) {
            onAddCategory(cat);
          }
          if (onCategorySelect) {
            onCategorySelect(cat);
          }
        }}
        existingCategories={[
          'Development',
          'Design',
          'Tools',
          'Reading',
          'Work',
          'Personal',
          'General',
          ...customCategories,
        ]}
      />

      {/* Single Bookmark Delete Dialog */}
      <BookmarkDeleteDialog
        isOpen={deletingBookmark !== null}
        onClose={() => setDeletingBookmark(null)}
        onConfirm={handleConfirmDelete}
        title={deletingBookmark?.title || ''}
        itemCount={1}
      />

      {/* Bulk Delete Dialog */}
      <BookmarkDeleteDialog
        isOpen={isBulkDeleting}
        onClose={() => setIsBulkDeleting(false)}
        onConfirm={handleConfirmDelete}
        title=""
        itemCount={selectedBookmarkIds.size}
      />

      {/* QR Code Modal */}
      <BookmarkQRCodeModal
        bookmark={qrBookmark}
        isOpen={qrBookmark !== null}
        onClose={() => setQrBookmark(null)}
      />
    </div>
  );
};
