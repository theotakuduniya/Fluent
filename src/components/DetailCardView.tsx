import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  Globe,
  Star,
  Edit3,
  Trash2,
  Copy,
  Check,
  Video,
  MessageSquare,
  Clock,
  Plus,
  X,
  FileText,
} from 'lucide-react';
import { Contact, ActivityLog } from '../types/contact';
import { getActivityLogs, addActivityLog, updateContact } from '../services/db';
import { motion } from 'motion/react';

interface DetailCardViewProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onToggleFavorite: (contactId: string, current: number) => void;
  onClose?: () => void;
  onContactUpdated?: (updated: Contact) => void;
}

export const DetailCardView: React.FC<DetailCardViewProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClose,
  onContactUpdated,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<ActivityLog['type']>('note');
  const [notesDraft, setNotesDraft] = useState(contact.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setNotesDraft(contact.notes || '');
    loadActivities();
  }, [contact.id]);

  const loadActivities = async () => {
    try {
      const logs = await getActivityLogs(contact.id);
      setActivities(logs);
    } catch (e) {
      console.error('Failed to load activity logs from SQLite', e);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const updated = await updateContact({
        ...contact,
        notes: notesDraft,
      });
      if (onContactUpdated) {
        onContactUpdated(updated);
      }
    } catch (e) {
      console.error('Error saving notes to SQLite', e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    try {
      const log = await addActivityLog(contact.id, newNoteType, newNoteText.trim());
      setActivities([log, ...activities]);
      setNewNoteText('');
      setIsAddingNote(false);
    } catch (e) {
      console.error('Failed to add activity log to SQLite', e);
    }
  };

  const initials = `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`.toUpperCase() || 'U';

  const fullAddress = [
    contact.address_street,
    contact.address_city,
    contact.address_state,
    contact.address_zip,
    contact.address_country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1.0] }}
      className="h-full flex flex-col bg-white dark:bg-[#252525] border-l win-border-subtle overflow-y-auto select-none"
    >
      {/* Top Navigation / Action Bar */}
      <div className="h-12 win-acrylic px-4 flex items-center justify-between border-b win-border-subtle shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-1.5 text-xs text-[#666] dark:text-[#aaa]">
          <span>Contact Card</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-[#222] dark:text-[#eee]">{contact.category}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(contact.id, contact.is_favorite)}
            className={`p-1.5 rounded-md transition-colors ${
              contact.is_favorite
                ? 'text-amber-500 hover:bg-amber-500/10'
                : 'text-[#666] dark:text-[#aaa] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={contact.is_favorite ? 'Remove favorite' : 'Add favorite'}
          >
            <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => onEdit(contact)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-[#333] dark:text-[#ddd] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Edit contact details"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 rounded-md text-[#c42b1c] hover:bg-red-500/10 transition-colors"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#666] dark:text-[#aaa] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-1"
              title="Close card view"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Persona Header Card */}
        <div className="win-card-surface rounded-xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Persona Avatar */}
            {contact.avatar_url ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-[#383838] shadow-md">
                <img
                  src={contact.avatar_url}
                  alt={contact.display_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div
                  style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
                  className="w-full h-full flex items-center justify-center text-white font-bold text-2xl -mt-24"
                >
                  {initials}
                </div>
              </div>
            ) : (
              <div
                style={{ backgroundColor: contact.avatar_color || '#0078d4' }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md border-2 border-white dark:border-[#383838]"
              >
                {initials}
              </div>
            )}

            {/* Persona Details */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-[#1c1c1c] dark:text-[#f3f3f3] truncate">
                  {contact.display_name}
                </h2>
                <div className="text-xs text-[#555] dark:text-[#aaa] font-medium flex items-center justify-center sm:justify-start gap-1">
                  <span>{contact.category}</span>
                </div>
              </div>

              {(contact.job_title || contact.company) && (
                <p className="text-sm text-[#444] dark:text-[#bbb] mt-1 font-medium">
                  {contact.job_title}
                  {contact.job_title && contact.company && ' at '}
                  <span className="text-[#111] dark:text-[#eee]">{contact.company}</span>
                </p>
              )}

              {contact.department && (
                <p className="text-xs text-[#666] dark:text-[#999] mt-0.5">
                  {contact.department}
                </p>
              )}

              {/* Action Buttons: Call, Email, Message, Meet, Copy */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 pt-4 border-t border-black/6 dark:border-white/6">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/6 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#222] dark:text-[#eee] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`sms:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/6 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#222] dark:text-[#eee] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </a>
                )}

                {contact.email && (
                  <button
                    onClick={() => {
                      window.open(`https://teams.microsoft.com/l/chat/0/0?users=${contact.email}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/6 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#222] dark:text-[#eee] transition-colors"
                    title="Start video call"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Meet</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    handleCopy(
                      `${contact.display_name}\n${contact.phone}\n${contact.email}`,
                      'all'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/6 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#222] dark:text-[#eee] transition-colors"
                >
                  {copiedField === 'all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy vCard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Contact Information Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#888] px-1">
            Contact Information
          </h3>

          <div className="win-card-surface rounded-xl divide-y divide-black/6 dark:divide-white/6 overflow-hidden">
            {/* Primary Phone */}
            {contact.phone && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Mobile Phone</span>
                    <span className="text-xs font-medium font-mono tabular-nums text-[#111] dark:text-[#eee]">
                      {contact.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(contact.phone, 'phone')}
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#666] dark:text-[#aaa]"
                    title="Copy phone"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Work Phone */}
            {contact.work_phone && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Work Phone</span>
                    <span className="text-xs font-medium font-mono tabular-nums text-[#111] dark:text-[#eee]">
                      {contact.work_phone}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.work_phone!, 'work_phone')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#666] dark:text-[#aaa]"
                >
                  {copiedField === 'work_phone' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Primary Email */}
            {contact.email && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Primary Email</span>
                    <span className="text-xs font-medium text-[#111] dark:text-[#eee]">
                      {contact.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.email, 'email')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#666] dark:text-[#aaa]"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Secondary Email */}
            {contact.secondary_email && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Secondary Email</span>
                    <span className="text-xs font-medium text-[#111] dark:text-[#eee]">
                      {contact.secondary_email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.secondary_email!, 'sec_email')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#666] dark:text-[#aaa]"
                >
                  {copiedField === 'sec_email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Address */}
            {fullAddress && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Address</span>
                    <span className="text-xs font-medium text-[#111] dark:text-[#eee]">
                      {fullAddress}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(fullAddress, 'address')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#666] dark:text-[#aaa]"
                  title="Copy address"
                >
                  {copiedField === 'address' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Website */}
            {contact.website && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#777] dark:text-[#999] block">Website</span>
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-[#0078d4] dark:text-[#60cdff] hover:underline"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Birthday */}
            {contact.birthday && (
              <div className="p-3.5 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-[#777] dark:text-[#999] block">Birthday</span>
                  <span className="text-xs font-medium text-[#111] dark:text-[#eee]">
                    {contact.birthday}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Notes & Bio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#888]">
              Notes
            </h3>
            {notesDraft !== (contact.notes || '') && (
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-xs font-medium text-[#0078d4] dark:text-[#60cdff] hover:underline"
              >
                {isSavingNotes ? 'Saving to SQLite...' : 'Save Notes'}
              </button>
            )}
          </div>

          <div className="win-card-surface rounded-xl p-3.5">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add personal notes, meeting topics, or background info..."
              rows={3}
              className="w-full text-xs bg-transparent text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none resize-none placeholder-[#777] dark:placeholder-[#888]"
            />
          </div>
        </div>

        {/* Section 3: SQLite Activity Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#666] dark:text-[#888]">
                Activity & History
              </h3>
              <span className="text-[11px] text-[#888] font-mono tabular-nums">
                ({activities.length} records in SQLite)
              </span>
            </div>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1 text-xs font-medium text-[#0078d4] dark:text-[#60cdff] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log activity</span>
            </button>
          </div>

          {/* Quick add activity form */}
          {isAddingNote && (
            <form
              onSubmit={handleAddActivity}
              className="win-card-surface rounded-xl p-4 space-y-3 border-2 border-[#0078d4]/30"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#444] dark:text-[#bbb]">Type:</span>
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as ActivityLog['type'])}
                  className="text-xs bg-white dark:bg-[#333] border border-black/10 dark:border-white/10 rounded-md px-2 py-1 text-[#222] dark:text-[#eee]"
                >
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">General Note</option>
                  <option value="message">Message</option>
                </select>
              </div>

              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="What happened during this touchpoint?"
                rows={2}
                className="w-full text-xs p-2 rounded-md bg-white dark:bg-[#333] border border-black/10 dark:border-white/10 text-[#222] dark:text-[#eee] focus:outline-none focus:border-[#0078d4]"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs rounded-md text-[#555] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-medium rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe]"
                >
                  Save to SQLite
                </button>
              </div>
            </form>
          )}

          {/* Activity items list */}
          <div className="win-card-surface rounded-xl divide-y divide-black/6 dark:divide-white/6 overflow-hidden">
            {activities.length > 0 ? (
              activities.map((act) => {
                const dateStr = new Date(act.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <div key={act.id} className="p-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#aaa] shrink-0 mt-0.5">
                      {act.type === 'call' && <Phone className="w-3.5 h-3.5" />}
                      {act.type === 'email' && <Mail className="w-3.5 h-3.5" />}
                      {act.type === 'meeting' && <Clock className="w-3.5 h-3.5" />}
                      {act.type === 'message' && <MessageSquare className="w-3.5 h-3.5" />}
                      {act.type === 'note' && <FileText className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium capitalize text-[#222] dark:text-[#eee]">
                          {act.type}
                        </span>
                        <span className="text-[10px] font-mono text-[#888] tabular-nums">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-[#555] dark:text-[#bbb] mt-1 leading-relaxed">
                        {act.summary}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#888] dark:text-[#777]">
                No logged activity yet. Click "Log activity" to save touchpoints to SQLite.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
