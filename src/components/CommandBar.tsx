import React, { useRef } from 'react';
import {
  UserPlus,
  Trash2,
  Star,
  LayoutGrid,
  Columns2,
  Table as TableIcon,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { ViewMode, SortField, Contact } from '../types/contact';

interface CommandBarProps {
  onNewContact: () => void;
  selectedContact: Contact | null;
  onEditContact: () => void;
  onDeleteContact: () => void;
  onToggleFavorite: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  sortField: SortField;
  onChangeSortField: (sort: SortField) => void;
  onExportSqlite: () => void;
  onImportSqlite: (file: File) => void;
  onResetData: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({
  onNewContact,
  selectedContact,
  onEditContact,
  onDeleteContact,
  onToggleFavorite,
  viewMode,
  onChangeViewMode,
  sortField,
  onChangeSortField,
  onExportSqlite,
  onImportSqlite,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportSqlite(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-11 bg-white dark:bg-[#202020] flex items-center justify-between px-3 border-b border-black/[0.08] dark:border-white/[0.08] select-none shrink-0 gap-2 overflow-x-auto">
      {/* Left zone: Contact Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* + New Contact Primary Button */}
        <button
          onClick={onNewContact}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
          title="Create a new contact (N)"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>New contact</span>
        </button>

        {/* Selected Contact context buttons */}
        {selectedContact && (
          <>
            <button
              onClick={onEditContact}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>Edit</span>
            </button>

            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedContact.is_favorite
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title={selectedContact.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                className={`w-3.5 h-3.5 ${selectedContact.is_favorite ? 'fill-amber-500' : ''}`}
              />
              <span>{selectedContact.is_favorite ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={onDeleteContact}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md text-[#dc2626] hover:bg-red-500/10 transition-colors"
              title="Delete this contact"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </>
        )}
      </div>

      {/* Right zone: View Mode Switcher, Sort & SQLite Data Utilities */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sort selector */}
        <div className="flex items-center gap-1 bg-[#f4f5f7] dark:bg-white/5 rounded-md px-2 py-1">
          <ArrowUpDown className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa]" />
          <select
            value={sortField}
            onChange={(e) => onChangeSortField(e.target.value as SortField)}
            className="bg-transparent text-xs text-[#27272a] dark:text-[#e4e4e7] focus:outline-none cursor-pointer pr-1 font-medium"
          >
            <option value="name_asc" className="bg-white dark:bg-[#2c2c2c] dark:text-white">
              Name (A to Z)
            </option>
            <option value="name_desc" className="bg-white dark:bg-[#2c2c2c] dark:text-white">
              Name (Z to A)
            </option>
            <option value="company" className="bg-white dark:bg-[#2c2c2c] dark:text-white">
              Company
            </option>
            <option value="recent" className="bg-white dark:bg-[#2c2c2c] dark:text-white">
              Recently Updated
            </option>
          </select>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center bg-[#f4f5f7] dark:bg-white/5 p-0.5 rounded-md">
          <button
            onClick={() => onChangeViewMode('cards')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-[#383838] text-[#0078d4] dark:text-[#60cdff] shadow-xs'
                : 'text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode('split')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-[#383838] text-[#0078d4] dark:text-[#60cdff] shadow-xs'
                : 'text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white'
            }`}
            title="Split Master-Detail View"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#383838] text-[#0078d4] dark:text-[#60cdff] shadow-xs'
                : 'text-[#71717a] dark:text-[#a1a1aa] hover:text-[#18181b] dark:hover:text-white'
            }`}
            title="Data Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-black/[0.1] dark:bg-white/[0.1] mx-0.5" />

        {/* SQLite File Export/Import */}
        <button
          onClick={onExportSqlite}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Backup and download SQLite database (.sqlite file)"
        >
          <Download className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa]" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".sqlite,.db"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#52525b] dark:text-[#d4d4d8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Import SQLite database file (.sqlite)"
        >
          <Upload className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa]" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onResetData}
          className="p-1.5 text-xs rounded-md text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Reset database to default seed data"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
