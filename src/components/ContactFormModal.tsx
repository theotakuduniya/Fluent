import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  Globe,
  Calendar,
  FileText,
  Star,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
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

// Helper to resize image to max 400x400 so it stores cleanly and efficiently in SQLite
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
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [notes, setNotes] = useState('');
  const [birthday, setBirthday] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setAvatarInputUrl(initialContact.avatar_url || '');
      setNotes(initialContact.notes || '');
      setBirthday(initialContact.birthday || '');
      setWebsite(initialContact.website || '');
      setShowUrlInput(Boolean(initialContact.avatar_url && !initialContact.avatar_url.startsWith('data:')));
    } else {
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
      setAvatarInputUrl('');
      setShowUrlInput(false);
      setNotes('');
      setBirthday('');
      setWebsite('');
    }
    setErrorMessage('');
    setImageError(false);
  }, [initialContact, isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarUrl(dataUrl);
      setAvatarInputUrl('');
      setShowUrlInput(false);
      setImageError(false);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage('Failed to read image file.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (avatarInputUrl.trim()) {
      setAvatarUrl(avatarInputUrl.trim());
      setImageError(false);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setAvatarInputUrl('');
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <div className="px-6 py-4 flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] bg-[#fbfbfb] dark:bg-[#262626] shrink-0">
            <h2 className="text-base font-bold text-[#18181b] dark:text-[#f4f4f5]">
              {initialContact ? 'Edit contact' : 'New contact'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#71717a] hover:text-[#18181b] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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

            {/* Profile Picture (PFP) Upload & Styling Section */}
            <div className="p-4 bg-[#f8f9fa] dark:bg-white/[0.03] rounded-xl border border-black/[0.07] dark:border-white/[0.07] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#27272a] dark:text-[#e4e4e7]">
                  Profile Picture & Theme
                </span>
                {/* Favorite Toggle */}
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                    isFavorite
                      ? 'border-amber-400 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-black/10 dark:border-white/10 text-[#71717a] dark:text-[#a1a1aa] hover:bg-black/5'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  {avatarUrl && !imageError ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#383838] shadow-md">
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: avatarColor }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-white dark:border-[#383838]"
                    >
                      {previewInitials}
                    </div>
                  )}

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs hover:bg-red-700"
                      title="Remove profile picture"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Upload Buttons & Options */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#0078d4] dark:text-[#60cdff]" />
                      <span>Upload from file</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-xs"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
                      <span>Image URL</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md text-red-600 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove photo</span>
                      </button>
                    )}
                  </div>

                  {/* URL Input Dropdown */}
                  {showUrlInput && (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="url"
                        value={avatarInputUrl}
                        onChange={(e) => setAvatarInputUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 h-7 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-2.5 h-7 text-xs font-medium bg-[#0078d4] text-white rounded-md hover:bg-[#106ebe]"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Color Palette (for initials or background) */}
                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span className="text-[11px] text-[#71717a] dark:text-[#a1a1aa] mr-1">
                      Background:
                    </span>
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAvatarColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          avatarColor === c ? 'ring-2 ring-offset-2 ring-[#0078d4] scale-110' : 'hover:scale-105'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1">
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1">
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1">
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1">
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#71717a]" />
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#71717a]" />
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#71717a]" />
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#71717a]" />
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-[#71717a]" />
                  <span>Company</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Senior Product Designer"
                  className="w-full h-8 px-2.5 text-xs bg-white dark:bg-[#333] border border-black/15 dark:border-white/15 rounded-md text-[#1c1c1c] dark:text-[#f3f3f3] focus:outline-none focus:border-[#0078d4]"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#71717a]" />
                <span>Physical Address</span>
              </label>
              <input
                type="text"
                value={addressStreet}
                onChange={(e) => setAddressStreet(e.target.value)}
                placeholder="Street address"
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#71717a]" />
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
                <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#71717a]" />
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
              <label className="text-xs font-semibold text-[#27272a] dark:text-[#d4d4d8] block mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-[#71717a]" />
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
          <div className="px-6 py-3 bg-[#fbfbfb] dark:bg-[#262626] border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-md text-[#27272a] dark:text-[#e4e4e7] hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10 transition-colors"
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
