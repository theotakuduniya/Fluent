import React from 'react';
import { Star, Phone, Mail, Building, MoreHorizontal } from 'lucide-react';
import { Contact } from '../types/contact';

interface ContactTableViewProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  onToggleFavorite: (e: React.MouseEvent, contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}

export const ContactTableView: React.FC<ContactTableViewProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  onToggleFavorite,
  onEditContact,
  onDeleteContact,
}) => {
  return (
    <div className="w-full h-full overflow-auto bg-white/70 dark:bg-[#202020]/70 select-none">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-[#f9f9f9] dark:bg-[#2a2a2a] text-[#666] dark:text-[#aaa] font-medium border-b win-border-subtle z-10">
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
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {contacts.map((c) => {
            const isSelected = selectedContactId === c.id;
            const initials = `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase() || 'U';

            return (
              <tr
                key={c.id}
                onClick={() => onSelectContact(c)}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#0078d4]/10 dark:bg-[#60cdff]/15 font-medium'
                    : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                }`}
              >
                {/* Favorite */}
                <td className="py-2.5 px-3 text-center">
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(e, c)}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#888]"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        c.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-[#888]'
                      }`}
                    />
                  </button>
                </td>

                {/* Name & Avatar */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    {c.avatar_url ? (
                      <img
                        src={c.avatar_url}
                        alt={c.display_name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        style={{ backgroundColor: c.avatar_color || '#0078d4' }}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                      >
                        {initials}
                      </div>
                    )}
                    <span className="font-semibold text-[#1c1c1c] dark:text-[#f3f3f3] truncate">
                      {c.display_name}
                    </span>
                  </div>
                </td>

                {/* Category (unboxed text) */}
                <td className="py-2.5 px-3 text-[#555] dark:text-[#ccc]">
                  {c.category}
                </td>

                {/* Company & Role */}
                <td className="py-2.5 px-3 text-[#555] dark:text-[#bbb] truncate max-w-xs">
                  {c.company ? (
                    <span className="text-[#1c1c1c] dark:text-[#eee]">{c.company}</span>
                  ) : null}
                  {c.company && c.job_title && ' · '}
                  <span>{c.job_title || '—'}</span>
                </td>

                {/* Phone */}
                <td className="py-2.5 px-3 font-mono text-[11px] tabular-nums text-[#444] dark:text-[#bbb]">
                  {c.phone || '—'}
                </td>

                {/* Email */}
                <td className="py-2.5 px-3 text-[#444] dark:text-[#bbb] truncate max-w-xs">
                  {c.email || '—'}
                </td>

                {/* Location */}
                <td className="py-2.5 px-3 text-[#666] dark:text-[#aaa] truncate">
                  {[c.address_city, c.address_country].filter(Boolean).join(', ') || '—'}
                </td>

                {/* Row actions */}
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEditContact(c)}
                      className="px-2 py-0.5 text-[11px] rounded hover:bg-black/5 dark:hover:bg-white/5 text-[#0078d4] dark:text-[#60cdff]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteContact(c.id)}
                      className="px-2 py-0.5 text-[11px] rounded hover:bg-red-500/10 text-[#c42b1c]"
                    >
                      Delete
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
