import React, { useState } from 'react';
import { Phone, Mail, Building2, Star } from 'lucide-react';
import { Contact } from '../types/contact';
import { motion } from 'motion/react';

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
  onToggleFavorite: (e: React.MouseEvent, contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected,
  onSelect,
  onToggleFavorite,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.1, 0.9, 0.2, 1.0] }}
      onClick={() => onSelect(contact)}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-150 select-none ${
        isSelected
          ? 'bg-white dark:bg-[#323232] ring-2 ring-[#0078d4] dark:ring-[#60cdff] shadow-md border-transparent'
          : 'bg-white dark:bg-[#282828] hover:bg-white dark:hover:bg-[#2f2f2f] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0078d4]/40 dark:hover:border-[#60cdff]/40 shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Header: Avatar & Star Favorite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {contact.avatar_url && !imageError ? (
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-black/10 dark:border-white/10 shadow-2xs">
              <img
                src={contact.avatar_url}
                alt={contact.display_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div
              style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
            >
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-[#18181b] dark:text-[#f4f4f5] truncate leading-tight">
              {contact.display_name}
            </h3>
            {contact.job_title && (
              <p className="text-xs text-[#52525b] dark:text-[#d4d4d8] truncate mt-0.5">
                {contact.job_title}
              </p>
            )}
            {contact.company && (
              <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] truncate flex items-center gap-1 mt-0.5 font-medium">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{contact.company}</span>
              </p>
            )}
          </div>
        </div>

        {/* Favorite star */}
        <button
          type="button"
          onClick={(e) => onToggleFavorite(e, contact)}
          className={`p-1.5 rounded-md transition-colors ${
            contact.is_favorite
              ? 'text-amber-500 hover:bg-amber-500/10'
              : 'text-[#a1a1aa] dark:text-[#71717a] opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          title={contact.is_favorite ? 'Remove favorite' : 'Add favorite'}
        >
          <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Middle: Contact Channels */}
      <div className="mt-3.5 pt-3 border-t border-black/[0.07] dark:border-white/[0.07] space-y-1.5 text-xs text-[#52525b] dark:text-[#d4d4d8]">
        {contact.phone && (
          <div className="flex items-center gap-2 truncate">
            <Phone className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa] shrink-0" />
            <span className="truncate font-mono text-[11px] tabular-nums">{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3 h-3 text-[#71717a] dark:text-[#a1a1aa] shrink-0" />
            <span className="truncate text-[11px]">{contact.email}</span>
          </div>
        )}
      </div>

      {/* Footer: Category & City */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#71717a] dark:text-[#a1a1aa]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-[#27272a] dark:text-[#e4e4e7]">{contact.category}</span>
          {contact.address_city && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{contact.address_city}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
