import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  QrCode,
} from 'lucide-react';
import { Contact, ActivityLog } from '../../types/contact';
import { getActivityLogs, addActivityLog, updateContact } from '../../services/db';
import { motion } from 'motion/react';

interface DetailCardViewProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: string) => void;
  onToggleFavorite: (contactId: string, current: number) => void;
  onShowQr?: (contact: Contact) => void;
  onClose?: () => void;
  onContactUpdated?: (updated: Contact) => void;
}

function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const DetailCardView: React.FC<DetailCardViewProps> = ({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShowQr,
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
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNotesDraft(contact.notes || '');
    setImageError(false);
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

  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      const updated = await updateContact({
        ...contact,
        avatar_url: dataUrl,
      });
      setImageError(false);
      if (onContactUpdated) {
        onContactUpdated(updated);
      }
    } catch (err) {
      console.error('Error uploading photo', err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
      className="h-full flex flex-col bg-white dark:bg-[#202020] border-l border-black/[0.08] dark:border-white/[0.08] overflow-y-auto select-none"
    >
      {/* Top Navigation / Action Bar */}
      <div className="h-12 bg-white dark:bg-[#202020] px-4 flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-1.5 text-xs text-[#71717a] dark:text-[#a1a1aa]">
          <span>Contact Card</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#18181b] dark:text-[#f4f4f5]">{contact.category}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(contact.id, contact.is_favorite)}
            className={`p-1.5 rounded-md transition-colors ${
              contact.is_favorite
                ? 'text-amber-500 hover:bg-amber-500/10'
                : 'text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title={contact.is_favorite ? 'Remove favorite' : 'Add favorite'}
          >
            <Star className={`w-4 h-4 ${contact.is_favorite ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => onEdit(contact)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Edit contact details"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {onShowQr && (
            <button
              onClick={() => onShowQr(contact)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md text-[#0078d4] dark:text-[#60cdff] hover:bg-[#0078d4]/10 dark:hover:bg-[#60cdff]/15 transition-colors"
              title="Share or scan QR code"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          )}

          <button
            onClick={() => onDelete(contact.id)}
            className="p-1.5 rounded-md text-[#dc2626] hover:bg-red-500/10 transition-colors"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ml-1"
              title="Close card view"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Hidden file input for photo upload directly from card */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleDirectPhotoUpload}
          className="hidden"
        />

        {/* Persona Header Card */}
        <div className="bg-white dark:bg-[#282828] border border-black/[0.08] dark:border-white/[0.08] shadow-xs rounded-xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Persona Avatar with Hover Change Photo */}
            <div className="relative group shrink-0">
              {contact.avatar_url && !imageError ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white dark:border-[#383838] shadow-md">
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
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md border-2 border-white dark:border-[#383838]"
                >
                  {initials}
                </div>
              )}

              {/* Change photo button on hover */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium"
                title="Change photo"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Upload</span>
              </button>
            </div>

            {/* Persona Details */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-[#18181b] dark:text-[#f4f4f5] truncate">
                  {contact.display_name}
                </h2>
                <div className="text-xs text-[#71717a] dark:text-[#a1a1aa] font-medium flex items-center justify-center sm:justify-start gap-1">
                  <span>{contact.category}</span>
                </div>
              </div>

              {(contact.job_title || contact.company) && (
                <p className="text-sm text-[#52525b] dark:text-[#d4d4d8] mt-1 font-medium">
                  {contact.job_title}
                  {contact.job_title && contact.company && ' at '}
                  <span className="text-[#18181b] dark:text-[#f4f4f5] font-semibold">{contact.company}</span>
                </p>
              )}

              {contact.department && (
                <p className="text-xs text-[#71717a] dark:text-[#a1a1aa] mt-0.5">
                  {contact.department}
                </p>
              )}

              {/* Action Buttons: Call, Email, Message, Meet, Copy */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4 pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}

                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#18181b] dark:text-[#f4f4f5] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}

                {contact.phone && (
                  <a
                    href={`sms:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#18181b] dark:text-[#f4f4f5] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </a>
                )}

                {onShowQr && (
                  <button
                    type="button"
                    onClick={() => onShowQr(contact)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4]/10 dark:bg-[#60cdff]/15 hover:bg-[#0078d4]/20 dark:hover:bg-[#60cdff]/25 text-[#0078d4] dark:text-[#60cdff] transition-all shadow-2xs"
                    title="Generate QR code for mobile scan"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#18181b] dark:text-[#f4f4f5] transition-colors"
                  title="Upload profile picture"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#60cdff]" />
                  <span>Photo</span>
                </button>

                <button
                  onClick={() =>
                    handleCopy(
                      `${contact.display_name}\n${contact.phone}\n${contact.email}`,
                      'all'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#18181b] dark:text-[#f4f4f5] transition-colors"
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
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] px-1">
            Contact Information
          </h3>

          <div className="bg-white dark:bg-[#282828] border border-black/[0.08] dark:border-white/[0.08] shadow-xs rounded-xl divide-y divide-black/[0.07] dark:divide-white/[0.07] overflow-hidden">
            {/* Primary Phone */}
            {contact.phone && (
              <div className="p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#555] dark:text-[#bbb]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Mobile Phone</span>
                    <span className="text-xs font-semibold font-mono tabular-nums text-[#18181b] dark:text-[#f4f4f5]">
                      {contact.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(contact.phone, 'phone')}
                    className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#71717a] dark:text-[#a1a1aa]"
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
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Work Phone</span>
                    <span className="text-xs font-semibold font-mono tabular-nums text-[#18181b] dark:text-[#f4f4f5]">
                      {contact.work_phone}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.work_phone!, 'work_phone')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#71717a] dark:text-[#a1a1aa]"
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
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Primary Email</span>
                    <span className="text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                      {contact.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.email, 'email')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#71717a] dark:text-[#a1a1aa]"
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
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Secondary Email</span>
                    <span className="text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                      {contact.secondary_email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(contact.secondary_email!, 'sec_email')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#71717a] dark:text-[#a1a1aa]"
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
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Address</span>
                    <span className="text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5]">
                      {fullAddress}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(fullAddress, 'address')}
                  className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[#71717a] dark:text-[#a1a1aa]"
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
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Website</span>
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#0078d4] dark:text-[#60cdff] hover:underline"
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
                  <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] block">Birthday</span>
                  <span className="text-xs font-semibold text-[#18181b] dark:text-[#f4f4f5]">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
              Notes
            </h3>
            {notesDraft !== (contact.notes || '') && (
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-xs font-semibold text-[#0078d4] dark:text-[#60cdff] hover:underline"
              >
                {isSavingNotes ? 'Saving to SQLite...' : 'Save Notes'}
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-[#282828] border border-black/[0.08] dark:border-white/[0.08] shadow-xs rounded-xl p-3.5">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add personal notes, meeting topics, or background info..."
              rows={3}
              className="w-full text-xs bg-transparent text-[#18181b] dark:text-[#f4f4f5] focus:outline-none resize-none placeholder-[#71717a] dark:placeholder-[#888]"
            />
          </div>
        </div>

        {/* Section 3: SQLite Activity Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
                Activity & History
              </h3>
              <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] font-mono tabular-nums">
                ({activities.length} records)
              </span>
            </div>

            <button
              onClick={() => setIsAddingNote(!isAddingNote)}
              className="flex items-center gap-1 text-xs font-semibold text-[#0078d4] dark:text-[#60cdff] hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log activity</span>
            </button>
          </div>

          {/* Quick add activity form */}
          {isAddingNote && (
            <form
              onSubmit={handleAddActivity}
              className="bg-white dark:bg-[#282828] rounded-xl p-4 space-y-3 border-2 border-[#0078d4]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8]">Type:</span>
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value as ActivityLog['type'])}
                  className="text-xs bg-white dark:bg-[#333] border border-black/10 dark:border-white/10 rounded-md px-2 py-1 text-[#18181b] dark:text-[#f4f4f5]"
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
                className="w-full text-xs p-2 rounded-md bg-[#f8f9fa] dark:bg-[#333] border border-black/10 dark:border-white/10 text-[#18181b] dark:text-[#f4f4f5] focus:outline-none focus:border-[#0078d4]"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 text-xs rounded-md text-[#52525b] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe]"
                >
                  Save Activity
                </button>
              </div>
            </form>
          )}

          {/* Activity items list */}
          <div className="bg-white dark:bg-[#282828] border border-black/[0.08] dark:border-white/[0.08] shadow-xs rounded-xl divide-y divide-black/[0.07] dark:divide-white/[0.07] overflow-hidden">
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
                        <span className="text-xs font-semibold capitalize text-[#18181b] dark:text-[#f4f4f5]">
                          {act.type}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717a] dark:text-[#a1a1aa] tabular-nums">
                          {dateStr}
                        </span>
                      </div>
                      <p className="text-xs text-[#52525b] dark:text-[#d4d4d8] mt-1 leading-relaxed">
                        {act.summary}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-[#71717a] dark:text-[#a1a1aa]">
                No logged activity yet. Click "Log activity" to record touchpoints.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
