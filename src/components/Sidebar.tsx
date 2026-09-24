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
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {!isCollapsed && (
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
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
                    ? 'bg-black/8 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff] font-semibold'
                    : 'text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.iconColor || (isActive ? 'text-[#0078d4] dark:text-[#60cdff]' : 'text-[#71717a] dark:text-[#a1a1aa]')
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
                    ? 'bg-black/8 dark:bg-white/10 text-[#0078d4] dark:text-[#60cdff] font-semibold'
                    : 'text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/4 dark:hover:bg-white/5'
                }`}
                title={isCollapsed ? `${item.label} (${item.count})` : undefined}
              >
                {isActive && <div className="win-nav-indicator" />}
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-[#0078d4] dark:text-[#60cdff]' : 'text-[#71717a] dark:text-[#a1a1aa]'
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

      {/* Clean Subtle Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-black/[0.08] dark:border-white/[0.08] text-[11px] text-[#71717a] dark:text-[#a1a1aa] flex items-center justify-between">
          <span>Local Storage</span>
          <span className="font-medium text-[#27272a] dark:text-[#e4e4e7]">SQLite</span>
        </div>
      )}
    </aside>
  );
};
