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
  Database,
  Terminal,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onQuickAdd: () => void;
  onOpenSqlConsole: () => void;
  totalContacts: number;
  favoriteCount: number;
  categoryCounts: Record<string, number>;
  sqliteVersion: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  activeCategory,
  onSelectCategory,
  onQuickAdd,
  onOpenSqlConsole,
  totalContacts,
  favoriteCount,
  categoryCounts,
  sqliteVersion,
}) => {
  const navItems = [
    { id: 'All', label: 'All Contacts', icon: Users, count: totalContacts },
    { id: 'Favorites', label: 'Favorites', icon: Star, count: favoriteCount, iconColor: 'text-amber-500' },
  ];

  const groupItems = [
    { id: 'Work', label: 'Work', icon: Briefcase, count: categoryCounts['Work'] || 0 },
    { id: 'Family', label: 'Family', icon: Heart, count: categoryCounts['Family'] || 0 },
    { id: 'Friends', label: 'Friends', icon: Smile, count: categoryCounts['Friends'] || 0 },
    { id: 'VIP', label: 'VIP', icon: ShieldCheck, count: categoryCounts['VIP'] || 0 },
    { id: 'Clients', label: 'Clients', icon: Building, count: categoryCounts['Clients'] || 0 },
    { id: 'Personal', label: 'Personal', icon: User, count: categoryCounts['Personal'] || 0 },
  ];

  return (
    <aside
      className={`h-full win-mica border-r win-border-subtle flex flex-col justify-between transition-all duration-200 ease-out select-none shrink-0 z-20 ${
        isCollapsed ? 'w-14' : 'w-60'
      }`}
    >
      {/* Top Header & Actions */}
      <div className="p-2 space-y-2">
        {/* Toggle Hamburger & Quick Add */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {!isCollapsed && (
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-[#0078d4] dark:bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center">
            <button
              onClick={onQuickAdd}
              className="w-8 h-8 rounded-md bg-[#0078d4] text-white flex items-center justify-center hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
              title="Quick Add Contact"
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
                className={`w-full relative flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-black/7 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff]'
                    : 'text-[#333] dark:text-[#e0e0e0] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.iconColor || (isActive ? 'text-[#0078d4] dark:text-[#60cdff]' : 'text-[#666] dark:text-[#aaa]')
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[#777] dark:text-[#888]">
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
              <div className="px-2.5 text-[10px] font-semibold tracking-wider text-[#888] dark:text-[#777] uppercase">
                Categories
              </div>
            ) : (
              <div className="w-6 h-px mx-auto bg-black/10 dark:bg-white/10" />
            )}
          </div>

          {/* Category Filter Items */}
          {groupItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`w-full relative flex items-center gap-3 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-black/7 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff]'
                    : 'text-[#333] dark:text-[#e0e0e0] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? `${item.label} (${item.count})` : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#0078d4] dark:text-[#60cdff]' : 'text-[#666] dark:text-[#aaa]'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[#777] dark:text-[#888]">
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer: SQLite Storage Status & Inspector */}
      <div className="p-2 border-t win-border-subtle bg-black/[0.02] dark:bg-white/[0.02]">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#555] dark:text-[#aaa]">
                <Database className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#60cdff]" />
                <span className="font-medium">SQLite Engine</span>
              </div>
              <span className="font-mono text-[10px] text-[#0078d4] dark:text-[#60cdff]">
                v{sqliteVersion}
              </span>
            </div>

            <button
              onClick={onOpenSqlConsole}
              className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#333] dark:text-[#ddd] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>SQL Inspector</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onOpenSqlConsole}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Open SQLite Inspector"
            >
              <Terminal className="w-4 h-4 text-[#0078d4] dark:text-[#60cdff]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
