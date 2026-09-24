import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, MapPin, Globe, Calendar, FileText, Star } from 'lucide-react';
import { Contact } from '../types/contact';
import { motion, AnimatePresence } from 'motion/react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: any) => Promise<void>;
  initialContact?: Contact | null;
}

const COLOR_OPTIONS = [
  '#0078d4', // Windows Blue
  '#107c41', // Excel Green
  '#5c2d91', // OneNote Purple
  '#d83b01', // Office Orange
  '#e3008c', // Fluent Magenta
  '#008272', // Teal
  '#004e8c', // Navy
  '#744da9', // Indigo
];

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContact,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [workPhone, setWorkPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<Contact['category']>('Work');
  const [isFavorite, setIsFavorite] = useState(false);
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [avatarColor, setAvatarColor] = useState(COLOR_OPTIONS[0]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [birthday, setBirthday] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialContact) {
      setFirstName(initialContact.first_name || '');
      setLastName(initialContact.last_name || '');
      setEmail(initialContact.email || '');
      setSecondaryEmail(initialContact.secondary_email || '');
      setPhone(initialContact.phone || '');
      setWorkPhone(initialContact.work_phone || '');
      setCompany(initialContact.company || '');
      setJobTitle(initialContact.job_title || '');
      setDepartment(initialContact.department || '');
      setCategory(initialContact.category || 'Work');
      setIsFavorite(Boolean(initialContact.is_favorite));
      setAddressStreet(initialContact.address_street || '');
      setAddressCity(initialContact.address_city || '');
      setAddressState(initialContact.address_state || '');
      setAddressZip(initialContact.address_zip || '');
      setAddressCountry(initialContact.address_country || '');
      setAvatarColor(initialContact.avatar_color || COLOR_OPTIONS[0]);
      setAvatarUrl(initialContact.avatar_url || '');
      setNotes(initialContact.notes || '');
      setBirthday(initialContact.birthday || '');
      setWebsite(initialContact.website || '');
    } else {
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setSecondaryEmail('');
      setPhone('');
      setWorkPhone('');
      setCompany('');
      setJobTitle('');
      setDepartment('');
      setCategory('Work');
      setIsFavorite(false);
      setAddressStreet('');
      setAddressCity('');
      setAddressState('');
      setAddressZip('');
      setAddressCountry('');
      setAvatarColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
      setAvatarUrl('');
      setNotes('');
      setBirthday('');
      setWebsite('');
    }
    setErrorMessage('');
  }, [initialContact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() && !lastName.trim()) {
      setErrorMessage('Please enter at least a first or last name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const payload: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim(),
        secondary_email: secondaryEmail.trim(),
        phone: phone.trim(),
        work_phone: workPhone.trim(),
        company: company.trim(),
        job_title: jobTitle.trim(),
        department: department.trim(),
        category,
        is_favorite: isFavorite ? 1 : 0,
        address_street: addressStreet.trim(),
        address_city: addressCity.trim(),
        address_state: addressState.trim(),
        address_zip: addressZip.trim(),
        address_country: addressCountry.trim(),
        avatar_color: avatarColor,
        avatar_url: avatarUrl.trim(),
        notes: notes.trim(),
        birthday: birthday.trim(),
        website: website.trim(),
      };

      if (initialContact?.id) {
        payload.id = initialContact.id;
        payload.created_at = initialContact.created_at;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving to SQLite database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewInitials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.1, 0.9, 0.2, 1.0] }}
          className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-[#2c2c2c] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        >
          {/* Windows 11 ContentDialog Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b win-border-subtle bg-[#f9f9f9]/80 dark:bg-[#262626]/80 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#1c1c1c] dark:text-[#f3f3f3]">
                {initialContact ? 'Edit contact' : 'New contact'}
              </h2>
              <span className="text-xs text-[#777] dark:text-[#888] font-mono">
                (SQLite Local Storage)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#777] hover:text-[#111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {errorMessage && (
              <div className="p-2.5 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                {errorMessage}
              </div>
            )}

            {/* Avatar & Color Picker */}
            <div className="flex items-center gap-4 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/5 dark:border-white/5">
              <div
                style={{ backgroundColor: avatarColor }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-xs"
              >
                {previewInitials}
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-medium text-[#444] dark:text-[#bbb] block">
                  Avatar Accent Color
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        avatarColor === c ? 'ring-2 ring-offset-2 ring-[#0078d4] scale-110' : 'hover:scale-105'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Favorite Toggle */}
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  isFavorite
                    ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-black/10 dark:border-white/10 text-[#666] dark:text-[#aaa]'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>Favorite</span>
              </button>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1">
                  First name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Elena"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Rostova"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Category & Department */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-8 px-2 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                >
                  <option value="Work">Work</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="VIP">VIP</option>
                  <option value="Clients">Clients</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Phones */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#777]" />
                  <span>Mobile Phone</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4] font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#777]" />
                  <span>Work Phone</span>
                </label>
                <input
                  type="text"
                  value={workPhone}
                  onChange={(e) => setWorkPhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4] font-mono"
                />
              </div>
            </div>

            {/* Emails */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#777]" />
                  <span>Primary Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#777]" />
                  <span>Secondary Email</span>
                </label>
                <input
                  type="email"
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  placeholder="alt@personal.net"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Company & Job Title */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-[#777]" />
                  <span>Company</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1">
                  Job title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Architect"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#777]" />
                <span>Address</span>
              </label>
              <input
                type="text"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                placeholder="Street address (e.g. 100 Main St)"
                className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="City"
                  className="col-span-2 h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
                <input
                  type="text"
                  value={addressState}
                  onChange={(e) => setAddressState(e.target.value)}
                  placeholder="State/Prov"
                  className="h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
                <input
                  type="text"
                  value={addressZip}
                  onChange={(e) => setAddressZip(e.target.value)}
                  placeholder="ZIP"
                  className="h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Website & Birthday */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#777]" />
                  <span>Website</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#777]" />
                  <span>Birthday</span>
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-[#444] dark:text-[#bbb] block mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#777]" />
                <span>Notes</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Background notes, project context, or reminders..."
                rows={3}
                className="w-full p-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4] resize-none"
              />
            </div>
          </form>

          {/* Windows 11 ContentDialog Footer */}
          <div className="px-6 py-3 bg-[#f9f9f9]/80 dark:bg-[#262626]/80 border-t win-border-subtle flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-md text-[#333] dark:text-[#ddd] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
