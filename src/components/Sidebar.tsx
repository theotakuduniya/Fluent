import React from 'react';
import {
  Users,
  Star,
  Briefcase,
  Heart,
  Smile,
  ShieldCheck,
  Building,
  User,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Bookmark as BookmarkIcon,
  Code2,
  Palette,
  Wrench,
  BookOpen,
  Folder,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onQuickAdd: () => void;
  totalContacts: number;
  favoriteCount: number;
  categoryCounts: Record<string, number>;
  activeModule?: 'contacts' | 'bookmarks';
  onSelectModule?: (mod: 'contacts' | 'bookmarks') => void;
  bookmarkStats?: {
    total: number;
    favorites: number;
    categoryCounts: Record<string, number>;
  };
  customBookmarkCategories?: string[];
  onAddCategory?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeCategory,
  onSelectCategory,
  onQuickAdd,
  totalContacts,
  favoriteCount,
  categoryCounts,
  activeModule = 'contacts',
  onSelectModule,
  bookmarkStats = { total: 0, favorites: 0, categoryCounts: {} },
  customBookmarkCategories = [],
  onAddCategory,
}) => {
  const isContacts = activeModule === 'contacts';

  // Navigation items based on active module
  const navItems = isContacts
    ? [
        { id: 'All', label: 'All Contacts', icon: Users, count: totalContacts },
        { id: 'Favorites', label: 'Favorites', icon: Star, count: favoriteCount, iconColor: 'text-amber-500' },
      ]
    : [
        { id: 'All', label: 'All Bookmarks', icon: BookmarkIcon, count: bookmarkStats.total },
        { id: 'Favorites', label: 'Favorites', icon: Star, count: bookmarkStats.favorites, iconColor: 'text-amber-500' },
      ];

  const defaultBookmarkCategories = [
    { id: 'Development', label: 'Development', icon: Code2 },
    { id: 'Design', label: 'Design', icon: Palette },
    { id: 'Tools', label: 'Tools', icon: Wrench },
    { id: 'Reading', label: 'Reading', icon: BookOpen },
    { id: 'Work', label: 'Work', icon: Briefcase },
    { id: 'Personal', label: 'Personal', icon: User },
    { id: 'General', label: 'General', icon: Folder },
  ];

  const bookmarkGroupItems = React.useMemo(() => {
    const list = [...defaultBookmarkCategories];
    const existingIds = new Set(list.map((c) => c.id));

    (customBookmarkCategories || []).forEach((cat) => {
      if (!existingIds.has(cat)) {
        list.push({ id: cat, label: cat, icon: Folder });
        existingIds.add(cat);
      }
    });

    Object.keys(bookmarkStats.categoryCounts || {}).forEach((cat) => {
      if (!existingIds.has(cat) && cat !== 'All' && cat !== 'Favorites') {
        list.push({ id: cat, label: cat, icon: Folder });
        existingIds.add(cat);
      }
    });

    return list.map((item) => ({
      ...item,
      count: bookmarkStats.categoryCounts[item.id] || 0,
    }));
  }, [bookmarkStats.categoryCounts, customBookmarkCategories]);

  const groupItems = isContacts
    ? [
        { id: 'Work', label: 'Work', icon: Briefcase, count: categoryCounts['Work'] || 0 },
        { id: 'Family', label: 'Family', icon: Heart, count: categoryCounts['Family'] || 0 },
        { id: 'Friends', label: 'Friends', icon: Smile, count: categoryCounts['Friends'] || 0 },
        { id: 'VIP', label: 'VIP', icon: ShieldCheck, count: categoryCounts['VIP'] || 0 },
        { id: 'Clients', label: 'Clients', icon: Building, count: categoryCounts['Clients'] || 0 },
        { id: 'Personal', label: 'Personal', icon: User, count: categoryCounts['Personal'] || 0 },
      ]
    : bookmarkGroupItems;

  const handleActionClick = () => {
    if (isContacts) {
      onQuickAdd();
    } else if (onAddCategory) {
      onAddCategory();
    } else {
      onQuickAdd();
    }
  };

  return (
    <aside
      className={`h-full bg-[#f8f9fa] dark:bg-[#202020] border-r border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between transition-all duration-200 ease-out select-none shrink-0 z-20 ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="p-2 space-y-2 overflow-y-auto">
        {/* Toggle Hamburger & Quick Add */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {!isCollapsed && (
            <button
              onClick={handleActionClick}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-white transition-all shadow-xs active:scale-95 cursor-pointer ${
                isContacts ? 'bg-[#0078d4] hover:bg-[#106ebe]' : 'bg-[#6366f1] hover:bg-[#4f46e5]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isContacts ? 'New Contact' : 'Add Category'}</span>
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center">
            <button
              onClick={handleActionClick}
              className={`w-8 h-8 rounded-md text-white flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer ${
                isContacts ? 'bg-[#0078d4] hover:bg-[#106ebe]' : 'bg-[#6366f1] hover:bg-[#4f46e5]'
              }`}
              title={isContacts ? 'Quick Add Contact' : 'Add Category'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Filter Links */}
        <nav className="space-y-0.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full relative flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isContacts
                      ? 'bg-black/8 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff] font-semibold'
                      : 'bg-black/8 dark:bg-white/10 text-[#6366f1] dark:text-[#a5b4fc] font-semibold'
                    : 'text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.iconColor ||
                    (isActive
                      ? isContacts
                        ? 'text-[#0078d4] dark:text-[#60cdff]'
                        : 'text-[#6366f1] dark:text-[#a5b4fc]'
                      : 'text-[#71717a] dark:text-[#a1a1aa]')
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[#71717a] dark:text-[#a1a1aa]">
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Group Divider */}
          <div className="pt-3 pb-1">
            {!isCollapsed ? (
              <div className="px-2.5 text-[10px] font-semibold tracking-wider text-[#71717a] dark:text-[#a1a1aa] uppercase">
                {isContacts ? 'Categories' : 'Collections'}
              </div>
            ) : (
              <div className="w-6 h-px mx-auto bg-black/10 dark:bg-white/10" />
            )}
          </div>

          {/* Group Items */}
          {groupItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full relative flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isContacts
                      ? 'bg-black/8 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff] font-semibold'
                      : 'bg-black/8 dark:bg-white/10 text-[#6366f1] dark:text-[#a5b4fc] font-semibold'
                    : 'text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? `${item.label} (${item.count})` : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? isContacts
                        ? 'text-[#0078d4] dark:text-[#60cdff]'
                        : 'text-[#6366f1] dark:text-[#a5b4fc]'
                      : 'text-[#71717a] dark:text-[#a1a1aa]'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[#71717a] dark:text-[#a1a1aa]">
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Workspace Switcher */}
      <div className="border-t border-black/[0.08] dark:border-white/[0.08] p-2 space-y-2">
        {onSelectModule && (
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => onSelectModule('contacts')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isContacts
                  ? 'bg-white dark:bg-[#303030] text-[#0078d4] dark:text-[#60cdff] shadow-2xs font-semibold'
                  : 'text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white'
              }`}
              title="Contacts Module"
            >
              <Users className="w-3.5 h-3.5" />
              {!isCollapsed && <span>Contacts</span>}
            </button>
            <button
              onClick={() => onSelectModule('bookmarks')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                !isContacts
                  ? 'bg-white dark:bg-[#303030] text-[#6366f1] dark:text-[#a5b4fc] shadow-2xs font-semibold'
                  : 'text-[#71717a] hover:text-[#18181b] dark:text-[#a1a1aa] dark:hover:text-white'
              }`}
              title="Bookmarks Module"
            >
              <BookmarkIcon className="w-3.5 h-3.5" />
              {!isCollapsed && <span>Bookmarks</span>}
            </button>
          </div>
        )}

        {!isCollapsed && (
          <div className="px-1 text-[11px] text-[#71717a] dark:text-[#a1a1aa] flex items-center justify-between">
            <span>Storage</span>
            <span className="font-medium text-[#27272a] dark:text-[#e4e4e7]">SQLite Wasm</span>
          </div>
        )}
      </div>
    </aside>
  );
};
