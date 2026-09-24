import { Contact } from '../types/contact';

export interface VCardExportOptions {
  includeWork?: boolean;
  includeAddress?: boolean;
  includeNotes?: boolean;
  includeBirthday?: boolean;
}

/**
 * Generates an RFC 2426 vCard 3.0 string compatible with iOS Contacts, Android Contacts, and Google Contacts.
 */
export function generateVCard(
  contact: Contact,
  options: VCardExportOptions = {
    includeWork: true,
    includeAddress: true,
    includeNotes: true,
    includeBirthday: true,
  }
): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const lastName = (contact.last_name || '').trim();
  const firstName = (contact.first_name || '').trim();
  const displayName = (contact.display_name || `${firstName} ${lastName}`.trim() || 'Contact').trim();

  // Structured name and formatted name
  lines.push(`N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`);
  lines.push(`FN:${escapeVCardValue(displayName)}`);

  // Organization & Job Title
  if (options.includeWork !== false) {
    if (contact.company) {
      lines.push(`ORG:${escapeVCardValue(contact.company)}`);
    }
    if (contact.job_title) {
      lines.push(`TITLE:${escapeVCardValue(contact.job_title)}`);
    }
    if (contact.department) {
      lines.push(`ROLE:${escapeVCardValue(contact.department)}`);
    }
  }

  // Phone numbers
  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhoneForVCard(contact.phone)}`);
  }
  if (contact.work_phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${cleanPhoneForVCard(contact.work_phone)}`);
  }

  // Email addresses
  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${contact.email.trim()}`);
  }
  if (contact.secondary_email) {
    lines.push(`EMAIL;TYPE=INTERNET:${contact.secondary_email.trim()}`);
  }

  // Website URL
  if (contact.website) {
    let url = contact.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    lines.push(`URL:${url}`);
  }

  // Physical Address
  if (options.includeAddress !== false) {
    const hasAddress =
      contact.address_street ||
      contact.address_city ||
      contact.address_state ||
      contact.address_zip ||
      contact.address_country;

    if (hasAddress) {
      const street = escapeVCardValue(contact.address_street || '');
      const city = escapeVCardValue(contact.address_city || '');
      const state = escapeVCardValue(contact.address_state || '');
      const zip = escapeVCardValue(contact.address_zip || '');
      const country = escapeVCardValue(contact.address_country || '');
      // ADR format: post-office box;extended;street;city;state;zip;country
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
    }
  }

  // Birthday
  if (options.includeBirthday !== false && contact.birthday) {
    lines.push(`BDAY:${contact.birthday}`);
  }

  // Category
  if (contact.category && contact.category !== 'All') {
    lines.push(`CATEGORIES:${contact.category}`);
  }

  // Notes
  if (options.includeNotes !== false && contact.notes) {
    lines.push(`NOTE:${escapeVCardValue(contact.notes)}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Generates human-friendly plain text summary for quick reading or notes.
 */
export function generateContactTextSummary(contact: Contact): string {
  const lines: string[] = [];
  lines.push(`👤 ${contact.display_name}`);

  if (contact.job_title && contact.company) {
    lines.push(`💼 ${contact.job_title} · ${contact.company}`);
  } else if (contact.company) {
    lines.push(`💼 ${contact.company}`);
  } else if (contact.job_title) {
    lines.push(`💼 ${contact.job_title}`);
  }

  if (contact.phone) lines.push(`📱 Mobile: ${contact.phone}`);
  if (contact.work_phone) lines.push(`☎️ Work: ${contact.work_phone}`);
  if (contact.email) lines.push(`✉️ Email: ${contact.email}`);
  if (contact.secondary_email) lines.push(`✉️ Alt Email: ${contact.secondary_email}`);
  if (contact.website) lines.push(`🌐 Web: ${contact.website}`);

  const address = [
    contact.address_street,
    contact.address_city,
    contact.address_state,
    contact.address_zip,
    contact.address_country,
  ]
    .filter(Boolean)
    .join(', ');

  if (address) lines.push(`📍 Address: ${address}`);
  if (contact.birthday) lines.push(`🎂 Birthday: ${contact.birthday}`);
  if (contact.notes) lines.push(`📝 Notes: ${contact.notes}`);

  return lines.join('\n');
}

/**
 * Downloads a .vcf file to the user's filesystem.
 */
export function downloadVCardFile(contact: Contact, options?: VCardExportOptions): void {
  const vCardString = generateVCard(contact, options);
  const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = (contact.display_name || 'contact')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  anchor.href = url;
  anchor.download = `${safeName}.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a combined .vcf file containing multiple contacts.
 */
export function downloadMultipleVCardsFile(contacts: Contact[], filename?: string): void {
  if (!contacts.length) return;
  const combinedVCard = contacts.map((c) => generateVCard(c)).join('\r\n\r\n');
  const blob = new Blob([combinedVCard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename || `contacts_export_${contacts.length}_items.vcf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function escapeVCardValue(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function cleanPhoneForVCard(phone: string): string {
  // Keep original formatting or international plus
  return phone.trim();
}
