import React, { useState, useEffect } from 'react';
import { X, Globe, Tag, Bookmark as BookmarkIcon, Star, FolderPlus, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark } from '../../types/bookmark';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Bookmark, 'id' | 'created_at' | 'updated_at' | 'click_count'>) => Promise<void>;
  initialBookmark?: Bookmark | null;
  availableCategories?: string[];
}

const CATEGORIES = [
  'Development',
  'Design',
  'Tools',
  'Reading',
  'Work',
  'Personal',
  'General',
];

export const BookmarkFormModal: React.FC<BookmarkFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBookmark,
  availableCategories = [],
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Development');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favicon, setFavicon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categoriesList = React.useMemo(() => {
    const list = [...CATEGORIES];
    availableCategories.forEach((c) => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }, [availableCategories]);

  useEffect(() => {
    if (initialBookmark) {
      setTitle(initialBookmark.title || '');
      setUrl(initialBookmark.url || '');
      setDescription(initialBookmark.description || '');
      setCategory(initialBookmark.category || 'Development');
      setTags(initialBookmark.tags || []);
      setIsFavorite(initialBookmark.is_favorite === 1);
      setFavicon(initialBookmark.favicon || '');
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategory('Development');
      setTags([]);
      setIsFavorite(false);
      setFavicon('');
    }
    setErrors({});
    setTagInput('');
  }, [initialBookmark, isOpen]);

  // Handle URL change and auto-suggest favicon & title if blank
  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (!val.trim()) return;

    try {
      let testUrl = val.trim();
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }
      const parsed = new URL(testUrl);
      const domain = parsed.hostname;
      if (!favicon || favicon.includes('favicons?domain=')) {
        setFavicon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      }
      if (!title && !initialBookmark) {
        // Humanize domain into preliminary title
        const cleanName = domain.replace(/^www\./, '').split('.')[0];
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch {
      // not yet a full URL, ignore
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    }
    if (!url.trim()) {
      errs.url = 'URL is required';
    } else {
      let testUrl = url.trim();
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = 'https://' + testUrl;
      }
      try {
        new URL(testUrl);
      } catch {
        errs.url = 'Please enter a valid URL';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      await onSave({
        title: title.trim(),
        url: finalUrl,
        description: description.trim(),
        category,
        tags,
        favicon: favicon || '',
        is_favorite: isFavorite ? 1 : 0,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Acrylic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white dark:bg-[#2b2b2b] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5 dark:border-white/5 bg-[#fbfbfb] dark:bg-[#323232]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#6366f1] text-white flex items-center justify-center shadow-xs">
                  <BookmarkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                    {initialBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
                  </h3>
                  <p className="text-[11px] text-[#71717a] dark:text-[#a1a1aa]">
                    Save and categorize web resources with SQLite storage
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* URL */}
              <div>
                <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a] dark:text-[#a1a1aa] pointer-events-none" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full h-9 pl-9 pr-3 text-xs bg-[#f4f5f7] dark:bg-[#202020] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#282828] focus:outline-none focus:border-[#6366f1] dark:focus:border-[#818cf8] transition-colors"
                  />
                </div>
                {errors.url && <p className="text-[11px] text-red-500 mt-1">{errors.url}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Windows App SDK Docs"
                  className="w-full h-9 px-3 text-xs bg-[#f4f5f7] dark:bg-[#202020] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#282828] focus:outline-none focus:border-[#6366f1] dark:focus:border-[#818cf8] transition-colors"
                />
                {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Category & Favorite Switch Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <FolderPlus className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a] dark:text-[#a1a1aa] pointer-events-none" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs bg-[#f4f5f7] dark:bg-[#202020] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#282828] focus:outline-none focus:border-[#6366f1] transition-colors appearance-none cursor-pointer"
                    >
                      {categoriesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                    Favorite
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`w-full h-9 px-3 rounded-md border flex items-center justify-between transition-colors text-xs cursor-pointer ${
                      isFavorite
                        ? 'border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                        : 'border-black/10 dark:border-white/10 bg-[#f4f5f7] dark:bg-[#202020] text-[#71717a] dark:text-[#a1a1aa]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                      <span>{isFavorite ? 'Pinned to Favorites' : 'Normal Bookmark'}</span>
                    </div>
                    {/* Win11 Toggle Pill */}
                    <div
                      className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
                        isFavorite ? 'bg-[#0078d4]' : 'bg-black/20 dark:bg-white/20'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                          isFavorite ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                  Description / Notes
                </label>
                <div className="relative">
                  <AlignLeft className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a] dark:text-[#a1a1aa] pointer-events-none" />
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief notes about this link or documentation..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#f4f5f7] dark:bg-[#202020] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#282828] focus:outline-none focus:border-[#6366f1] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5] mb-1">
                  Tags (Press Enter or Comma to add)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-2.5 text-[#71717a] dark:text-[#a1a1aa] pointer-events-none" />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag (e.g. react, design, docs)..."
                      className="w-full h-9 pl-9 pr-3 text-xs bg-[#f4f5f7] dark:bg-[#202020] text-[#18181b] dark:text-[#f4f4f5] border border-black/10 dark:border-white/10 rounded-md focus:bg-white dark:focus:bg-[#282828] focus:outline-none focus:border-[#6366f1] transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 h-9 text-xs font-medium rounded-md border border-black/10 dark:border-white/10 bg-[#fbfbfb] dark:bg-[#323232] hover:bg-[#f4f4f5] dark:hover:bg-[#383838] text-[#18181b] dark:text-[#f4f4f5] transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#6366f1]/10 text-[#6366f1] dark:bg-[#818cf8]/20 dark:text-[#a5b4fc] border border-[#6366f1]/20"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-medium rounded-md border border-black/10 dark:border-white/10 bg-[#fbfbfb] dark:bg-[#323232] hover:bg-[#f4f4f5] dark:hover:bg-[#383838] text-[#18181b] dark:text-[#f4f4f5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : initialBookmark ? 'Save Changes' : 'Create Bookmark'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
