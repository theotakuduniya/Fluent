import React, { useState, useRef, useEffect } from 'react';
import { Star, Phone, Mail, Building, Edit3, Trash2, QrCode, Check } from 'lucide-react';
import { Contact } from '../../types/contact';

interface ContactTableViewProps {
  contacts: Contact[];
  selectedContactId: string | null;
  selectedContactIds?: Set<string>;
  onSelectContact: (contact: Contact) => void;
  onToggleSelect?: (contact: Contact, e: React.MouseEvent) => void;
  onToggleSelectAll?: () => void;
  allSelected?: boolean;
  onToggleFavorite: (e: React.MouseEvent, contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onShowQr?: (contact: Contact) => void;
}

const TableRowAvatar: React.FC<{ contact: Contact }> = ({ contact }) => {
  const [imageError, setImageError] = useState(false);
  const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase() || 'U';

  if (contact.avatar_url && !imageError) {
    return (
      <img
        src={contact.avatar_url}
        alt={contact.display_name}
        referrerPolicy="no-referrer"
        className="w-7 h-7 rounded-full object-cover shrink-0 border border-black/10 dark:border-white/10"
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
    >
      {initials}
    </div>
  );
};

export const ContactTableView: React.FC<ContactTableViewProps> = ({
  contacts,
  selectedContactId,
  selectedContactIds = new Set(),
  onSelectContact,
  onToggleSelect,
  onToggleSelectAll,
  allSelected = false,
  onToggleFavorite,
  onEditContact,
  onDeleteContact,
  onShowQr,
}) => {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const isMultiSelectActive = selectedContactIds.size > 0;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        selectedContactIds.size > 0 && !allSelected;
    }
  }, [selectedContactIds, allSelected]);

  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-[#202020] select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#262626] text-[#71717a] dark:text-[#a1a1aa] font-semibold border-b border-black/[0.08] dark:border-white/[0.08] z-10">
          <tr>
            {/* Multi-select header checkbox */}
            <th className="py-2.5 px-3 w-8 text-center">
              <input
                type="checkbox"
                ref={headerCheckboxRef}
                checked={allSelected && contacts.length > 0}
                onChange={() => onToggleSelectAll && onToggleSelectAll()}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#0078d4] focus:ring-[#0078d4] cursor-pointer accent-[#0078d4]"
                title={allSelected ? 'Deselect all' : 'Select all'}
              />
            </th>
            <th className="py-2.5 px-2 w-8"></th>
            <th className="py-2.5 px-3">Name</th>
            <th className="py-2.5 px-3">Category</th>
            <th className="py-2.5 px-3">Company & Title</th>
            <th className="py-2.5 px-3">Phone</th>
            <th className="py-2.5 px-3">Email</th>
            <th className="py-2.5 px-3">Location</th>
            <th className="py-2.5 px-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
          {contacts.map((c) => {
            const isSingleActive = selectedContactId === c.id;
            const isMultiChecked = selectedContactIds.has(c.id);

            const handleRowClick = (e: React.MouseEvent) => {
              if (isMultiSelectActive && onToggleSelect) {
                onToggleSelect(c, e);
              } else {
                onSelectContact(c);
              }
            };

            return (
              <tr
                key={c.id}
                onClick={handleRowClick}
                className={`cursor-pointer transition-colors ${
                  isMultiChecked
                    ? 'bg-[#0078d4]/10 dark:bg-[#60cdff]/15 font-medium'
                    : isSingleActive
                    ? 'bg-black/[0.04] dark:bg-white/[0.05] font-medium'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                {/* Row Checkbox */}
                <td
                  className="py-2.5 px-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isMultiChecked}
                    onChange={(e) => onToggleSelect && onToggleSelect(c, e as any)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#0078d4] focus:ring-[#0078d4] cursor-pointer accent-[#0078d4]"
                  />
                </td>

                {/* Favorite */}
                <td className="py-2.5 px-2 text-center">
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(e, c)}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#a1a1aa]"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        c.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-[#a1a1aa]'
                      }`}
                    />
                  </button>
                </td>

                {/* Name & Avatar */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <TableRowAvatar contact={c} />
                    <span className="font-semibold text-[#18181b] dark:text-[#f4f4f5] truncate">
                      {c.display_name}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="py-2.5 px-3">
                  <span className="text-xs text-[#52525b] dark:text-[#d4d4d8] font-medium">
                    {c.category}
                  </span>
                </td>

                {/* Company & Title */}
                <td className="py-2.5 px-3">
                  <div className="truncate max-w-[200px]">
                    <div className="font-medium text-[#18181b] dark:text-[#f4f4f5] truncate">
                      {c.company || '—'}
                    </div>
                    {c.job_title && (
                      <div className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] truncate">
                        {c.job_title}
                      </div>
                    )}
                  </div>
                </td>

                {/* Phone */}
                <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-[#52525b] dark:text-[#d4d4d8]">
                  {c.phone || '—'}
                </td>

                {/* Email */}
                <td className="py-2.5 px-3 text-[#52525b] dark:text-[#d4d4d8] truncate max-w-[180px]">
                  {c.email || '—'}
                </td>

                {/* Location */}
                <td className="py-2.5 px-3 text-[#71717a] dark:text-[#a1a1aa]">
                  {c.address_city
                    ? `${c.address_city}${c.address_state ? `, ${c.address_state}` : ''}`
                    : '—'}
                </td>

                {/* Actions */}
                <td className="py-2.5 px-3 text-right">
                  <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {onShowQr && (
                      <button
                        onClick={() => onShowQr(c)}
                        className="p-1 rounded text-[#71717a] hover:text-[#0078d4] dark:hover:text-[#60cdff] hover:bg-black/5 dark:hover:bg-white/5"
                        title="Share or scan QR code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onEditContact(c)}
                      className="p-1 rounded text-[#71717a] hover:text-[#18181b] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(c.id)}
                      className="p-1 rounded text-[#71717a] hover:text-red-600 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
