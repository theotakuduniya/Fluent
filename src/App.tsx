import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { ContactCard } from './components/ContactCard';
import { DetailCardView } from './components/DetailCardView';
import { ContactTableView } from './components/ContactTableView';
import { ContactFormModal } from './components/ContactFormModal';
import { SqliteConsoleModal } from './components/SqliteConsoleModal';
import { DeleteDialog } from './components/DeleteDialog';
import { InfoBar, ToastNotice } from './components/InfoBar';
import { Contact, ViewMode, SortField } from './types/contact';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  toggleFavorite,
  getDatabaseStats,
  exportSqliteBinary,
  importSqliteBinary,
  resetDatabaseToDefault,
} from './services/db';
import { Users, Search, UserPlus, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fluent_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isSqlConsoleOpen, setIsSqlConsoleOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  // Database stats state
  const [dbStats, setDbStats] = useState({
    total: 0,
    favorites: 0,
    categories: 0,
    activities: 0,
    byteSize: 0,
    sqliteVersion: '3.x',
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

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fluent_dark_mode', String(darkMode));
  }, [darkMode]);

  // Load contacts and stats from SQLite
  const refreshData = useCallback(async () => {
    try {
      const [list, stats] = await Promise.all([
        getContacts(activeCategory, searchQuery, sortField),
        getDatabaseStats(),
      ]);
      setContacts(list);
      setDbStats(stats);
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

  // Handlers
  const handleSaveContact = async (contactData: any) => {
    if (contactData.id) {
      const updated = await updateContact(contactData);
      addToast('success', `Updated "${updated.display_name}" in SQLite storage`);
    } else {
      const created = await createContact(contactData);
      setSelectedContactId(created.id);
      addToast('success', `Added "${created.display_name}" to SQLite storage`);
    }
    await refreshData();
  };

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return;
    try {
      await deleteContact(contactToDelete.id);
      addToast('info', `Deleted "${contactToDelete.display_name}" from SQLite`);
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
      // If typing inside an input or textarea, ignore
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
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
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f3f3f3] dark:bg-[#202020] text-[#1c1c1c] dark:text-[#f3f3f3]">
      {/* 1. Windows 11 Fluent TitleBar */}
      <TitleBar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSqlConsole={() => setIsSqlConsoleOpen(true)}
        contactCount={dbStats.total}
        dbByteSize={dbStats.byteSize}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2. Responsive Navigation Sidebar for Filtering */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSelectedContactId(null);
          }}
          onQuickAdd={() => {
            setEditingContact(null);
            setIsFormModalOpen(true);
          }}
          onOpenSqlConsole={() => setIsSqlConsoleOpen(true)}
          totalContacts={dbStats.total}
          favoriteCount={dbStats.favorites}
          categoryCounts={categoryCounts}
          sqliteVersion={dbStats.sqliteVersion}
        />

        {/* 3. Main Center Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f9f9f9]/50 dark:bg-[#1f1f1f]/50">
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
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            sortField={sortField}
            onChangeSortField={setSortField}
            onExportSqlite={handleExportSqlite}
            onImportSqlite={handleImportSqlite}
            onResetData={handleResetData}
          />

          {/* View Content Area with Fluid Transitions */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#0078d4] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-[#777] dark:text-[#999] font-mono">
                    Initializing SQLite Local Database...
                  </p>
                </div>
              </div>
            ) : contacts.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="max-w-sm text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-[#777]">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1c1c1c] dark:text-[#f3f3f3]">
                    {searchQuery ? 'No matching contacts found' : 'No contacts in this category'}
                  </h3>
                  <p className="text-xs text-[#666] dark:text-[#aaa]">
                    {searchQuery
                      ? `No contacts matched "${searchQuery}". Clear your search query or add a new record to SQLite.`
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
                onSelectContact={(c) => {
                  setSelectedContactId(c.id);
                }}
                onToggleFavorite={handleToggleFavorite}
                onEditContact={(c) => {
                  setEditingContact(c);
                  setIsFormModalOpen(true);
                }}
                onDeleteContact={(id) => {
                  const target = contacts.find((c) => c.id === id);
                  if (target) setContactToDelete(target);
                }}
              />
            ) : viewMode === 'split' ? (
              /* 2. Split Master-Detail View */
              <div className="flex-1 flex w-full h-full min-h-0">
                {/* Master list */}
                <div className="w-80 md:w-96 border-r win-border-subtle flex flex-col h-full overflow-y-auto p-3 space-y-2 shrink-0">
                  <div className="px-1 text-[11px] font-mono text-[#888]">
                    {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} in SQLite
                  </div>
                  {contacts.map((c) => (
                    <ContactCard
                      key={c.id}
                      contact={c}
                      isSelected={selectedContactId === c.id}
                      onSelect={(item) => setSelectedContactId(item.id)}
                      onToggleFavorite={handleToggleFavorite}
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
                      onContactUpdated={(updated) => {
                        refreshData();
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-[#888]">
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
                        onSelect={(item) => {
                          setSelectedContactId(item.id);
                        }}
                        onToggleFavorite={handleToggleFavorite}
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
                    <div className="h-10 px-3 flex items-center border-b win-border-subtle bg-[#f9f9f9] dark:bg-[#252525]">
                      <button
                        onClick={() => setSelectedContactId(null)}
                        className="flex items-center gap-1.5 text-xs text-[#0078d4] dark:text-[#60cdff] font-medium"
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
        isOpen={Boolean(contactToDelete)}
        contactName={contactToDelete?.display_name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setContactToDelete(null)}
      />

      {/* SQLite Console & Inspector Modal */}
      <SqliteConsoleModal
        isOpen={isSqlConsoleOpen}
        onClose={() => setIsSqlConsoleOpen(false)}
        sqliteVersion={dbStats.sqliteVersion}
        totalContacts={dbStats.total}
        totalActivities={dbStats.activities}
        dbByteSize={dbStats.byteSize}
        onDataModified={refreshData}
      />

      {/* InfoBar Status Notifications */}
      <InfoBar notices={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
