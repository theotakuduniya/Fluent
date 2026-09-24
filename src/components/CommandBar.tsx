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
    <div className="h-11 win-acrylic flex items-center justify-between px-3 border-b win-border-subtle select-none shrink-0 gap-2 overflow-x-auto">
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-[#333] dark:text-[#ddd] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span>Edit</span>
            </button>

            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedContact.is_favorite
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5'
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
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-[#c42b1c] hover:bg-red-500/10 transition-colors"
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
        <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-md px-2 py-1">
          <ArrowUpDown className="w-3 h-3 text-[#777] dark:text-[#999]" />
          <select
            value={sortField}
            onChange={(e) => onChangeSortField(e.target.value as SortField)}
            className="bg-transparent text-xs text-[#333] dark:text-[#ddd] focus:outline-none cursor-pointer pr-1"
          >
            <option value="name_asc" className="dark:bg-[#2c2c2c] dark:text-white">
              Name (A to Z)
            </option>
            <option value="name_desc" className="dark:bg-[#2c2c2c] dark:text-white">
              Name (Z to A)
            </option>
            <option value="company" className="dark:bg-[#2c2c2c] dark:text-white">
              Company
            </option>
            <option value="recent" className="dark:bg-[#2c2c2c] dark:text-white">
              Recently Updated
            </option>
          </select>
        </div>

        {/* View mode segmented switcher */}
        <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-md">
          <button
            onClick={() => onChangeViewMode('cards')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-[#383838] text-[#0078d4] dark:text-[#60cdff] shadow-xs'
                : 'text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'
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
                : 'text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'
            }`}
            title="Split Detailed View"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#383838] text-[#0078d4] dark:text-[#60cdff] shadow-xs'
                : 'text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white'
            }`}
            title="Table View"
          >
            <TableIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical divider */}
        <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-1" />

        {/* Export SQLite File */}
        <button
          onClick={onExportSqlite}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#444] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Export current SQLite database (.sqlite)"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Import SQLite File */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".sqlite,.db,.sqlite3"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-[#444] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Import an existing SQLite database file"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={onResetData}
          className="p-1.5 text-xs rounded-md text-[#666] dark:text-[#aaa] hover:text-[#222] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Reset to default seed contacts"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
