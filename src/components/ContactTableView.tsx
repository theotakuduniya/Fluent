import React, { useState } from 'react';
import { Star, Phone, Mail, Building, Edit3, Trash2 } from 'lucide-react';
import { Contact } from '../types/contact';

interface ContactTableViewProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  onToggleFavorite: (e: React.MouseEvent, contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
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
  onSelectContact,
  onToggleFavorite,
  onEditContact,
  onDeleteContact,
}) => {
  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-[#202020] select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-[#f8f9fa] dark:bg-[#262626] text-[#71717a] dark:text-[#a1a1aa] font-semibold border-b border-black/[0.08] dark:border-white/[0.08] z-10">
          <tr>
            <th className="py-2.5 px-3 w-9"></th>
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
            const isSelected = selectedContactId === c.id;

            return (
              <tr
                key={c.id}
                onClick={() => onSelectContact(c)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#0078d4]/10 dark:bg-[#60cdff]/15 font-medium'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                {/* Favorite */}
                <td className="py-2.5 px-3 text-center">
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
