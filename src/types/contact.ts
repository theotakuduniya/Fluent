export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  secondary_email?: string;
  phone: string;
  work_phone?: string;
  company?: string;
  job_title?: string;
  department?: string;
  category: 'All' | 'Work' | 'Family' | 'Friends' | 'VIP' | 'Clients' | 'Personal';
  is_favorite: number; // 0 or 1 for SQLite integer boolean
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  avatar_color?: string;
  avatar_url?: string;
  notes?: string;
  birthday?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  contact_id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'message';
  summary: string;
  timestamp: string;
}

export type ViewMode = 'cards' | 'split' | 'table';

export type SortField = 'name_asc' | 'name_desc' | 'company' | 'recent';

export interface SqlQueryResult {
  columns: string[];
  values: (string | number | null | Uint8Array | any)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}
