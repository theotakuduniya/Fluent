import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { InfoBar, ToastNotice } from './components/InfoBar';
import {
  BulkActionBar,
  ContactCard,
  DetailCardView,
  ContactTableView,
  ContactFormModal,
  DeleteDialog,
  ContactQRCodeModal,
} from './components/contacts';
import { BookmarkModule } from './components/bookmarks';
import { Contact, ViewMode, SortField } from './types/contact';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  bulkUpdateCategory,
  bulkToggleFavorite,
  toggleFavorite,
  getDatabaseStats,
  getBookmarkStats,
  exportSqliteBinary,
  importSqliteBinary,
  resetDatabaseToDefault,
} from './services/db';
import { downloadMultipleVCardsFile } from './utils/vcard';
import { Users, UserPlus, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeModule, setActiveModule] = useState<'contacts' | 'bookmarks'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [bookmarkCategory, setBookmarkCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fluent_dark_mode');
    if (saved !== null) return saved === 'true';
    return false; // Default to crisp Windows 11 Light Mode
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [qrModalContact, setQrModalContact] = useState<Contact | null>(null);

  // Database stats state
  const [dbStats, setDbStats] = useState({
    total: 0,
    favorites: 0,
    categories: 0,
    activities: 0,
    byteSize: 0,
    sqliteVersion: '3.x',
  });

  const [bookmarkStats, setBookmarkStats] = useState({
    total: 0,
    favorites: 0,
    categoryCounts: {} as Record<string, number>,
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const addToast = (type: 'success' | 'info' | 'error', message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Sync dark mode class and theme attribute
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('fluent_dark_mode', String(darkMode));
  }, [darkMode]);

  // Load contacts and stats from SQLite
  const refreshData = useCallback(async () => {
    try {
      const [list, stats, bStats] = await Promise.all([
        getContacts(activeCategory, searchQuery, sortField),
        getDatabaseStats(),
        getBookmarkStats(),
      ]);
      setContacts(list);
      setDbStats(stats);
      setBookmarkStats(bStats);
      if (list.length > 0 && !selectedContactId) {
        // default select first if in split mode
        if (viewMode === 'split') {
          setSelectedContactId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to query SQLite database', err);
      addToast('error', 'Error reading from SQLite database');
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery, sortField, viewMode, selectedContactId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Selected contact object
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  // Multi-selection state helpers
  const areAllSelectedFavorites = useMemo(() => {
    if (selectedContactIds.size === 0) return false;
    const selectedList = contacts.filter((c) => selectedContactIds.has(c.id));
    return selectedList.length > 0 && selectedList.every((c) => c.is_favorite === 1);
  }, [contacts, selectedContactIds]);

  const handleToggleSelect = (contact: Contact) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contact.id)) {
        next.delete(contact.id);
      } else {
        next.add(contact.id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (contacts.length === 0) return;
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contacts.map((c) => c.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedContactIds(new Set());
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedContactIds.size === 0) return;
    const count = selectedContactIds.size;
    try {
      await bulkDeleteContacts(Array.from(selectedContactIds));
      addToast('info', `Deleted ${count} ${count === 1 ? 'contact' : 'contacts'}`);
      if (selectedContactId && selectedContactIds.has(selectedContactId)) {
        setSelectedContactId(null);
      }
      setSelectedContactIds(new Set());
      setIsBulkDeleting(false);
      await refreshData();
    } catch (err: any) {
      addToast('error', `Failed to delete contacts: ${err.message}`);
    }
  };

  const handleBulkMoveCategory = async (category: string) => {
    if (selectedContactIds.size === 0) return;
    const count = selectedContactIds.size;
    try {
      await bulkUpdateCategory(Array.from(selectedContactIds), category);
      addToast('success', `Moved ${count} ${count === 1 ? 'contact' : 'contacts'} to ${category}`);
      setSelectedContactIds(new Set());
      await refreshData();
    } catch (err: any) {
      addToast('error', `Failed to move contacts: ${err.message}`);
    }
  };

  const handleBulkToggleFavorite = async () => {
    if (selectedContactIds.size === 0) return;
    const count = selectedContactIds.size;
    const nextFavState = !areAllSelectedFavorites;
    try {
      await bulkToggleFavorite(Array.from(selectedContactIds), nextFavState);
      addToast(
        'info',
        nextFavState
          ? `Added ${count} ${count === 1 ? 'contact' : 'contacts'} to Favorites`
          : `Removed ${count} ${count === 1 ? 'contact' : 'contacts'} from Favorites`
      );
      await refreshData();
    } catch (err: any) {
      addToast('error', `Failed to update favorites: ${err.message}`);
    }
  };

  const handleBulkExport = () => {
    const selectedList = contacts.filter((c) => selectedContactIds.has(c.id));
    if (!selectedList.length) return;
    downloadMultipleVCardsFile(selectedList, `contacts_export_${selectedList.length}_selected.vcf`);
    addToast('success', `Exported ${selectedList.length} contacts (.vcf)`);
  };

  // Handlers
  const handleSaveContact = async (contactData: any) => {
    if (contactData.id) {
      const updated = await updateContact(contactData);
      addToast('success', `Updated "${updated.display_name}"`);
    } else {
      const created = await createContact(contactData);
      setSelectedContactId(created.id);
      addToast('success', `Added "${created.display_name}"`);
    }
    await refreshData();
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact(contactToDelete.id);
      addToast('info', `Deleted "${contactToDelete.display_name}"`);
      if (selectedContactId === contactToDelete.id) {
        setSelectedContactId(null);
      }
      setContactToDelete(null);
      await refreshData();
    } catch (err: any) {
      addToast('error', `Failed to delete contact: ${err.message}`);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent | null, contact: Contact) => {
    if (e) e.stopPropagation();
    try {
      const next = await toggleFavorite(contact.id, contact.is_favorite);
      addToast(
        'info',
        next ? `Added ${contact.display_name} to Favorites` : `Removed ${contact.display_name} from Favorites`
      );
      await refreshData();
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  const handleExportSqlite = async () => {
    try {
      const blob = await exportSqliteBinary();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluent_contacts_${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addToast('success', 'SQLite database exported successfully (.sqlite)');
    } catch (e) {
      addToast('error', 'Failed to export SQLite database');
    }
  };

  const handleImportSqlite = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      await importSqliteBinary(buffer);
      addToast('success', `Imported "${file.name}" SQLite database!`);
      setSelectedContactId(null);
      await refreshData();
    } catch (err: any) {
      addToast('error', `Import failed: ${err.message}`);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset database to default seed contacts?')) {
      await resetDatabaseToDefault();
      addToast('info', 'SQLite database reset to default demo dataset');
      setSelectedContactId(null);
      await refreshData();
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Escape key to clear multi-selection
      if (e.key === 'Escape' && selectedContactIds.size > 0) {
        e.preventDefault();
        setSelectedContactIds(new Set());
        return;
      }

      // Ctrl+A / Cmd+A to select all visible contacts
      if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A') && contacts.length > 0) {
        e.preventDefault();
        setSelectedContactIds(new Set(contacts.map((c) => c.id)));
        return;
      }

      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setEditingContact(null);
        setIsFormModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedContactIds, contacts]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f5f7] dark:bg-[#1a1a1a] text-[#18181b] dark:text-[#f4f4f5]">
      {/* 1. Windows 11 Fluent TitleBar */}
      <TitleBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          setSearchQuery('');
        }}
        contactCount={dbStats.total}
        bookmarkCount={bookmarkStats.total}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. Responsive Navigation Sidebar for Filtering */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeCategory={activeModule === 'contacts' ? activeCategory : bookmarkCategory}
          onSelectCategory={(cat) => {
            if (activeModule === 'contacts') {
              setActiveCategory(cat);
              setSelectedContactId(null);
              setSelectedContactIds(new Set());
            } else {
              setBookmarkCategory(cat);
            }
          }}
          onQuickAdd={() => {
            if (activeModule === 'contacts') {
              setEditingContact(null);
              setIsFormModalOpen(true);
            } else {
              window.dispatchEvent(new CustomEvent('fluent:new-bookmark'));
            }
          }}
          totalContacts={dbStats.total}
          favoriteCount={dbStats.favorites}
          categoryCounts={categoryCounts}
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            setSearchQuery('');
          }}
          bookmarkStats={bookmarkStats}
        />

        {/* 3. Main Center Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f5f7] dark:bg-[#1a1a1a]">
          {activeModule === 'bookmarks' ? (
            <BookmarkModule
              searchQuery={searchQuery}
              activeCategory={bookmarkCategory}
              onCategorySelect={setBookmarkCategory}
              onShowInfoBar={(msg, type) => addToast(type || 'info', msg)}
            />
          ) : (
            <>
              {/* Windows Fluent CommandBar */}
          <CommandBar
            onNewContact={() => {
              setEditingContact(null);
              setIsFormModalOpen(true);
            }}
            selectedContact={selectedContact}
            onEditContact={() => {
              if (selectedContact) {
                setEditingContact(selectedContact);
                setIsFormModalOpen(true);
              }
            }}
            onDeleteContact={() => {
              if (selectedContact) {
                setContactToDelete(selectedContact);
              }
            }}
            onToggleFavorite={() => {
              if (selectedContact) {
                handleToggleFavorite(null, selectedContact);
              }
            }}
            onShowQrContact={() => {
              if (selectedContact) {
                setQrModalContact(selectedContact);
              }
            }}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            sortField={sortField}
            onChangeSortField={setSortField}
            onExportSqlite={handleExportSqlite}
            onImportSqlite={handleImportSqlite}
            onResetData={handleResetData}
            isMultiSelectActive={selectedContactIds.size > 0}
            onToggleSelectAll={handleToggleSelectAll}
          />

          {/* Contextual Bulk Action Bar */}
          <AnimatePresence>
            {selectedContactIds.size > 0 && (
              <BulkActionBar
                selectedCount={selectedContactIds.size}
                totalVisibleCount={contacts.length}
                allSelected={contacts.length > 0 && selectedContactIds.size === contacts.length}
                onToggleSelectAll={handleToggleSelectAll}
                onClearSelection={handleClearSelection}
                onBulkDelete={() => setIsBulkDeleting(true)}
                onBulkMoveCategory={handleBulkMoveCategory}
                onBulkToggleFavorite={handleBulkToggleFavorite}
                areAllFavorites={areAllSelectedFavorites}
                onBulkExport={handleBulkExport}
              />
            )}
          </AnimatePresence>

          {/* View Content Area with Fluid Transitions */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] font-mono">
                    Loading contacts...
                  </p>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-sm text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-[#71717a]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#18181b] dark:text-[#f4f4f5]">
                    {searchQuery ? 'No matching contacts found' : 'No contacts in this category'}
                  </h3>
                  <p className="text-xs text-[#52525b] dark:text-[#a1a1aa]">
                    {searchQuery
                      ? `No contacts matched "${searchQuery}". Clear your search query or add a new record.`
                      : 'Get started by creating your first contact entry or reset to demo data.'}
                  </p>
                  <button
                    onClick={() => {
                      if (searchQuery) {
                        setSearchQuery('');
                      } else {
                        setEditingContact(null);
                        setIsFormModalOpen(true);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{searchQuery ? 'Clear Search' : 'Add First Contact'}</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'table' ? (
              /* 1. Table View */
              <ContactTableView
                contacts={contacts}
                selectedContactId={selectedContactId}
                selectedContactIds={selectedContactIds}
                allSelected={contacts.length > 0 && selectedContactIds.size === contacts.length}
                onSelectContact={(c) => {
                  setSelectedContactId(c.id);
                }}
                onToggleSelect={(c) => handleToggleSelect(c)}
                onToggleSelectAll={handleToggleSelectAll}
                onToggleFavorite={handleToggleFavorite}
                onEditContact={(c) => {
                  setEditingContact(c);
                  setIsFormModalOpen(true);
                }}
                onDeleteContact={(id) => {
                  const target = contacts.find((c) => c.id === id);
                  if (target) setContactToDelete(target);
                }}
                onShowQr={(c) => setQrModalContact(c)}
              />
            ) : viewMode === 'split' ? (
              /* 2. Split Master-Detail View */
              <div className="flex-1 flex w-full h-full min-h-0">
                {/* Master list */}
                <div className="w-80 md:w-96 border-r border-black/[0.08] dark:border-white/[0.08] bg-[#f8f9fa] dark:bg-[#1e1e1e] flex flex-col h-full overflow-y-auto p-3 space-y-2 shrink-0">
                  <div className="px-1 text-[11px] font-mono text-[#71717a] dark:text-[#a1a1aa]">
                    {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
                  </div>
                  {contacts.map((c) => (
                    <ContactCard
                      key={c.id}
                      contact={c}
                      isSelected={selectedContactId === c.id}
                      isMultiSelected={selectedContactIds.has(c.id)}
                      isMultiSelectActive={selectedContactIds.size > 0}
                      onSelect={(item) => setSelectedContactId(item.id)}
                      onToggleSelect={(item) => handleToggleSelect(item)}
                      onToggleFavorite={handleToggleFavorite}
                      onShowQr={(e, item) => setQrModalContact(item)}
                    />
                  ))}
                </div>

                {/* Detail View */}
                <div className="flex-1 h-full overflow-y-auto">
                  {selectedContact ? (
                    <DetailCardView
                      contact={selectedContact}
                      onEdit={(c) => {
                        setEditingContact(c);
                        setIsFormModalOpen(true);
                      }}
                      onDelete={(id) => {
                        setContactToDelete(selectedContact);
                      }}
                      onToggleFavorite={(id, curr) => handleToggleFavorite(null, selectedContact)}
                      onShowQr={(c) => setQrModalContact(c)}
                      onContactUpdated={(updated) => {
                        refreshData();
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#71717a] dark:text-[#a1a1aa]">
                      Select a contact to view detailed persona card
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 3. Cards Grid View */
              <div className="flex-1 flex w-full h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                    {contacts.map((c) => (
                      <ContactCard
                        key={c.id}
                        contact={c}
                        isSelected={selectedContactId === c.id}
                        isMultiSelected={selectedContactIds.has(c.id)}
                        isMultiSelectActive={selectedContactIds.size > 0}
                        onSelect={(item) => {
                          setSelectedContactId(item.id);
                        }}
                        onToggleSelect={(item) => handleToggleSelect(item)}
                        onToggleFavorite={handleToggleFavorite}
                        onShowQr={(e, item) => setQrModalContact(item)}
                      />
                    ))}
                  </div>
                </div>

                {/* Sliding Persona Detail Drawer on card select */}
                <AnimatePresence>
                  {selectedContact && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 440, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.1, 0.9, 0.2, 1.0] }}
                      className="hidden lg:block shrink-0 h-full overflow-hidden shadow-xl"
                    >
                      <div className="w-[440px] h-full">
                        <DetailCardView
                          contact={selectedContact}
                          onClose={() => setSelectedContactId(null)}
                          onEdit={(c) => {
                            setEditingContact(c);
                            setIsFormModalOpen(true);
                          }}
                          onDelete={(id) => {
                            setContactToDelete(selectedContact);
                          }}
                          onToggleFavorite={(id, curr) => handleToggleFavorite(null, selectedContact)}
                          onShowQr={(c) => setQrModalContact(c)}
                          onContactUpdated={(updated) => {
                            refreshData();
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile Full Screen Detail Overlay */}
                {selectedContact && (
                  <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-[#202020] flex flex-col">
                    <div className="h-10 px-3 flex items-center border-b border-black/[0.08] dark:border-white/[0.08] bg-[#f8f9fa] dark:bg-[#252525]">
                      <button
                        onClick={() => setSelectedContactId(null)}
                        className="flex items-center gap-1.5 text-xs text-[#0078d4] dark:text-[#60cdff] font-semibold"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to contacts</span>
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <DetailCardView
                        contact={selectedContact}
                        onClose={() => setSelectedContactId(null)}
                        onEdit={(c) => {
                          setEditingContact(c);
                          setIsFormModalOpen(true);
                        }}
                        onDelete={(id) => {
                          setContactToDelete(selectedContact);
                        }}
                        onToggleFavorite={(id, curr) => handleToggleFavorite(null, selectedContact)}
                        onShowQr={(c) => setQrModalContact(c)}
                        onContactUpdated={(updated) => {
                          refreshData();
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Add / Edit Contact ContentDialog */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
        initialContact={editingContact}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={Boolean(contactToDelete) || isBulkDeleting}
        contactName={contactToDelete?.display_name || ''}
        count={isBulkDeleting ? selectedContactIds.size : 1}
        onConfirm={isBulkDeleting ? handleBulkDeleteConfirm : handleDeleteConfirm}
        onCancel={() => {
          setContactToDelete(null);
          setIsBulkDeleting(false);
        }}
      />

      {/* Contact QR Code Share & Mobile Scan Modal */}
      <ContactQRCodeModal
        isOpen={Boolean(qrModalContact)}
        contact={qrModalContact}
        onClose={() => setQrModalContact(null)}
      />

      {/* InfoBar Status Notifications */}
      <InfoBar notices={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
