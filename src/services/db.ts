import initSqlJs from 'sql.js/dist/sql-asm.js';
import type { Database } from 'sql.js';
import { Contact, ActivityLog, SqlQueryResult, SortField } from '../types/contact';
import { Bookmark, BookmarkSortField } from '../types/bookmark';

const DB_STORAGE_KEY = 'fluent_contacts_sqlite_db';
const IDB_NAME = 'FluentContactsDB';
const IDB_STORE = 'sqlite_store';
const IDB_KEY = 'database_binary';

let dbInstance: Database | null = null;
let sqlModule: any = null;

// IndexedDB persistence helpers
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIDB(data: Uint8Array): Promise<void> {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(data, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB save failed, falling back to localStorage if size permits', err);
    try {
      // Fallback base64 in localStorage if small
      const binaryString = Array.from(data).map(byte => String.fromCharCode(byte)).join('');
      localStorage.setItem(DB_STORAGE_KEY, btoa(binaryString));
    } catch (e) {
      console.warn('LocalStorage fallback also failed', e);
    }
  }
}

async function loadFromIDB(): Promise<Uint8Array | null> {
  try {
    const idb = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        if (req.result instanceof Uint8Array) {
          resolve(req.result);
        } else if (req.result) {
          resolve(new Uint8Array(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IDB load failed, trying localStorage', err);
    try {
      const saved = localStorage.getItem(DB_STORAGE_KEY);
      if (saved) {
        const bin = atob(saved);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) {
          bytes[i] = bin.charCodeAt(i);
        }
        return bytes;
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
    return null;
  }
}

// Initial seed data
const SEED_CONTACTS: Partial<Contact>[] = [
  {
    id: 'c1-sarah-chen',
    first_name: 'Sarah',
    last_name: 'Chen',
    display_name: 'Sarah Chen',
    email: 'sarah.chen@microsoft.design',
    secondary_email: 'sarah.chen@alum.mit.edu',
    phone: '+1 (425) 555-0143',
    work_phone: '+1 (425) 555-8821',
    company: 'Fluent Systems',
    job_title: 'Design Director',
    department: 'Human Interface & Experience',
    category: 'Work',
    is_favorite: 1,
    address_street: 'One Microsoft Way',
    address_city: 'Redmond',
    address_state: 'WA',
    address_zip: '98052',
    address_country: 'United States',
    avatar_color: '#0078d4',
    avatar_url: '/src/assets/images/avatar_sarah_chen_1790238737808.jpg',
    notes: 'Key collaborator on Windows UI design system components. Enjoys typography and ergonomic hardware design.',
    birthday: '1988-04-12',
    website: 'https://fluent-design.example.com',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c2-marcus-vance',
    first_name: 'Marcus',
    last_name: 'Vance',
    display_name: 'Marcus Vance',
    email: 'm.vance@solaris-labs.io',
    phone: '+1 (206) 555-0189',
    work_phone: '+1 (206) 555-4920',
    company: 'Solaris Systems',
    job_title: 'Principal Distributed Architect',
    department: 'Cloud Platform Engineering',
    category: 'Work',
    is_favorite: 1,
    address_street: '400 Pine Street, Suite 900',
    address_city: 'Seattle',
    address_state: 'WA',
    address_zip: '98101',
    address_country: 'United States',
    avatar_color: '#107c41',
    avatar_url: '/src/assets/images/avatar_marcus_vance_1790238754658.jpg',
    notes: 'Spearheading the SQLite local storage database caching layer. Schedule monthly architectural catchup.',
    birthday: '1985-09-18',
    website: 'https://solaris-labs.io',
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'c3-elena-rostova',
    first_name: 'Elena',
    last_name: 'Rostova',
    display_name: 'Elena Rostova',
    email: 'elena.rostova@acme-ventures.ch',
    phone: '+41 22 555 0192',
    company: 'Horizon Equity',
    job_title: 'General Partner',
    department: 'Strategic Investments',
    category: 'VIP',
    is_favorite: 1,
    address_street: 'Rue du Rhône 42',
    address_city: 'Geneva',
    address_state: 'GE',
    address_zip: '1204',
    address_country: 'Switzerland',
    avatar_color: '#5c2d91',
    avatar_url: '/src/assets/images/avatar_elena_rostova_1790238769915.jpg',
    notes: 'Investor in modern desktop tooling and high-performance WebAssembly runtimes. Prefers communication via secure email.',
    birthday: '1983-11-05',
    website: 'https://acme-ventures.ch',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'c4-david-kim',
    first_name: 'David',
    last_name: 'Kim',
    display_name: 'David Kim',
    email: 'david.kim@prismtech.co',
    phone: '+1 (415) 555-0177',
    company: 'Prism Creative',
    job_title: 'Lead Product Manager',
    department: 'Desktop Applications',
    category: 'Work',
    is_favorite: 0,
    address_street: '580 Howard Street',
    address_city: 'San Francisco',
    address_state: 'CA',
    address_zip: '94105',
    address_country: 'United States',
    avatar_color: '#d83b01',
    avatar_url: '/src/assets/images/avatar_david_kim_1790238782673.jpg',
    notes: 'Organizer for the upcoming Windows Fluent UI design workshop. Reviewing card view interaction states.',
    birthday: '1992-07-23',
    website: 'https://prismtech.co',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'c5-amara-okafor',
    first_name: 'Amara',
    last_name: 'Okafor',
    display_name: 'Amara Okafor',
    email: 'amara.okafor@familymail.org',
    phone: '+1 (512) 555-0164',
    company: 'Austin Medical Center',
    job_title: 'Cardiothoracic Fellow',
    department: 'Surgical Sciences',
    category: 'Family',
    is_favorite: 1,
    address_street: '1201 W 38th St',
    address_city: 'Austin',
    address_state: 'TX',
    address_zip: '78705',
    address_country: 'United States',
    avatar_color: '#e3008c',
    notes: 'Sister. Sunday family dinners at 6 PM. Send birthday card in March.',
    birthday: '1990-03-30',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'c6-julian-alvarez',
    first_name: 'Julian',
    last_name: 'Alvarez',
    display_name: 'Julian Alvarez',
    email: 'julian.alvarez@studio-norte.es',
    phone: '+34 91 555 0122',
    company: 'Studio Norte',
    job_title: 'Motion & Spatial Designer',
    department: 'Animation Lab',
    category: 'Friends',
    is_favorite: 0,
    address_street: 'Calle Gran Vía 28',
    address_city: 'Madrid',
    address_state: 'MD',
    address_zip: '28013',
    address_country: 'Spain',
    avatar_color: '#008272',
    notes: 'Crafted the custom cubic bezier curves and fluid spring transitions. Great coffee enthusiast.',
    birthday: '1994-12-14',
    website: 'https://studio-norte.es',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'c7-charlotte-dupuis',
    first_name: 'Charlotte',
    last_name: 'Dupuis',
    display_name: 'Charlotte Dupuis',
    email: 'charlotte@dupuis-legal.fr',
    phone: '+33 1 55 55 01 88',
    company: 'Dupuis & Associés',
    job_title: 'Managing Partner',
    department: 'Intellectual Property',
    category: 'Clients',
    is_favorite: 0,
    address_street: '14 Boulevard Haussmann',
    address_city: 'Paris',
    address_state: 'IDF',
    address_zip: '75009',
    address_country: 'France',
    avatar_color: '#004e8c',
    notes: 'Contract review scheduled for next quarter. Direct liaison for patent filings.',
    birthday: '1981-06-08',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
];

const SEED_ACTIVITY: Partial<ActivityLog>[] = [
  {
    id: 'act-1',
    contact_id: 'c1-sarah-chen',
    type: 'call',
    summary: 'Discussed Windows 11 Mica background tokens and high-contrast accessibility standards.',
    timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'act-2',
    contact_id: 'c1-sarah-chen',
    type: 'meeting',
    summary: 'Design sprint review: Persona card visual hierarchy and CommandBar layout approved.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'act-3',
    contact_id: 'c2-marcus-vance',
    type: 'note',
    summary: 'Benchmarked SQLite in WebAssembly: sub-millisecond query latency for 10,000 indexed records.',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'act-4',
    contact_id: 'c3-elena-rostova',
    type: 'email',
    summary: 'Sent updated architecture overview showcasing offline SQLite file persistence.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'act-5',
    contact_id: 'c6-julian-alvarez',
    type: 'message',
    summary: 'Shared fluid spring transition presets for smooth drawer and split-pane animations.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

const SEED_BOOKMARKS: Partial<Bookmark>[] = [
  {
    id: 'bm-fluent-design',
    title: 'Fluent 2 Design System',
    url: 'https://fluent2.microsoft.design',
    description: 'Microsoft Fluent 2 design language guidelines, tokens, and components for Windows 11 & cross-platform apps.',
    category: 'Design',
    tags: ['design', 'fluent', 'microsoft', 'ui-kit'],
    favicon: 'https://www.google.com/s2/favicons?domain=microsoft.design&sz=64',
    is_favorite: 1,
    click_count: 24,
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bm-win-app-sdk',
    title: 'Windows App SDK & WinUI 3',
    url: 'https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/',
    description: 'Build modern desktop Windows 11 applications with WinUI 3 controls, Mica, Acrylic, and native APIs.',
    category: 'Development',
    tags: ['windows11', 'winui', 'desktop', 'sdk'],
    favicon: 'https://www.google.com/s2/favicons?domain=learn.microsoft.com&sz=64',
    is_favorite: 1,
    click_count: 18,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'bm-sqlite-wasm',
    title: 'SQLite Wasm Documentation',
    url: 'https://sqlite.org/wasm/doc/trunk/index.md',
    description: 'High-performance in-memory and persistent relational database engine running client-side in WebAssembly.',
    category: 'Development',
    tags: ['sqlite', 'database', 'wasm', 'sql'],
    favicon: 'https://www.google.com/s2/favicons?domain=sqlite.org&sz=64',
    is_favorite: 1,
    click_count: 31,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'bm-lucide-icons',
    title: 'Lucide Icons Directory',
    url: 'https://lucide.dev/icons/',
    description: 'Beautiful & consistent open-source icon suite for modern user interfaces and Windows 11 Fluent style.',
    category: 'Design',
    tags: ['icons', 'svg', 'design', 'lucide'],
    favicon: 'https://www.google.com/s2/favicons?domain=lucide.dev&sz=64',
    is_favorite: 0,
    click_count: 14,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bm-tailwind-css',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com/docs',
    description: 'A utility-first CSS framework packed with classes that can be composed to build any design.',
    category: 'Tools',
    tags: ['css', 'frontend', 'styling', 'framework'],
    favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64',
    is_favorite: 0,
    click_count: 9,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'bm-typescript-handbook',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    description: 'Comprehensive guide to TypeScript syntax, compiler options, type checking, and modern best practices.',
    category: 'Reading',
    tags: ['typescript', 'javascript', 'handbook', 'docs'],
    favicon: 'https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=64',
    is_favorite: 0,
    click_count: 12,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bm-github',
    title: 'GitHub Repositories',
    url: 'https://github.com',
    description: 'World leading developer platform to build, collaborate, and deliver open-source software.',
    category: 'Work',
    tags: ['git', 'code', 'collaboration', 'devtools'],
    favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    is_favorite: 1,
    click_count: 42,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'bm-mdn-web',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: 'The premier open resources for developers on Web standards: HTML5, CSS3, JavaScript, Web APIs.',
    category: 'Reading',
    tags: ['web', 'reference', 'html', 'javascript'],
    favicon: 'https://www.google.com/s2/favicons?domain=developer.mozilla.org&sz=64',
    is_favorite: 0,
    click_count: 17,
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

export async function getSqliteDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!sqlModule) {
    sqlModule = await initSqlJs();
  }

  const existingData = await loadFromIDB();
  if (existingData && existingData.length > 0) {
    try {
      const db = new sqlModule.Database(existingData) as Database;
      ensureBookmarksTable(db);
      dbInstance = db;
      return db;
    } catch (e) {
      console.error('Failed to parse existing SQLite binary, recreating clean database', e);
    }
  }

  // Create new SQLite database and schema
  const db = new sqlModule.Database() as Database;
  initializeSchema(db);
  seedInitialData(db);
  ensureBookmarksTable(db);
  dbInstance = db;
  await persistDatabase();

  return db;
}

function ensureBookmarksTable(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'General',
      tags TEXT,
      favicon TEXT,
      is_favorite INTEGER DEFAULT 0,
      click_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_favorite ON bookmarks(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_title ON bookmarks(title);
  `);

  try {
    const res = db.exec('SELECT count(*) as count FROM bookmarks');
    const count = (res[0]?.values[0]?.[0] as number) || 0;
    if (count === 0) {
      const stmt = db.prepare(`
        INSERT INTO bookmarks (
          id, title, url, description, category, tags, favicon, is_favorite, click_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const bm of SEED_BOOKMARKS) {
        stmt.run([
          bm.id || `bm-${Date.now()}-${Math.random()}`,
          bm.title || '',
          bm.url || '',
          bm.description || '',
          bm.category || 'General',
          JSON.stringify(bm.tags || []),
          bm.favicon || '',
          bm.is_favorite ? 1 : 0,
          bm.click_count || 0,
          bm.created_at || new Date().toISOString(),
          bm.updated_at || new Date().toISOString(),
        ]);
      }
      stmt.free();
    }
  } catch (err) {
    console.error('Error seeding bookmarks table', err);
  }
}

function initializeSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT,
      secondary_email TEXT,
      phone TEXT,
      work_phone TEXT,
      company TEXT,
      job_title TEXT,
      department TEXT,
      category TEXT DEFAULT 'All',
      is_favorite INTEGER DEFAULT 0,
      address_street TEXT,
      address_city TEXT,
      address_state TEXT,
      address_zip TEXT,
      address_country TEXT,
      avatar_color TEXT,
      avatar_url TEXT,
      notes TEXT,
      birthday TEXT,
      website TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      type TEXT NOT NULL,
      summary TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(last_name, first_name);
    CREATE INDEX IF NOT EXISTS idx_contacts_category ON contacts(category);
    CREATE INDEX IF NOT EXISTS idx_contacts_favorite ON contacts(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_activity_contact ON activity_logs(contact_id);
  `);
}

function seedInitialData(db: Database) {
  const insertContact = db.prepare(`
    INSERT INTO contacts (
      id, first_name, last_name, display_name, email, secondary_email,
      phone, work_phone, company, job_title, department, category,
      is_favorite, address_street, address_city, address_state, address_zip,
      address_country, avatar_color, avatar_url, notes, birthday, website,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  for (const c of SEED_CONTACTS) {
    insertContact.run([
      c.id || `c-${Date.now()}-${Math.random()}`,
      c.first_name || '',
      c.last_name || '',
      c.display_name || `${c.first_name} ${c.last_name}`,
      c.email || '',
      c.secondary_email || '',
      c.phone || '',
      c.work_phone || '',
      c.company || '',
      c.job_title || '',
      c.department || '',
      c.category || 'All',
      c.is_favorite ?? 0,
      c.address_street || '',
      c.address_city || '',
      c.address_state || '',
      c.address_zip || '',
      c.address_country || '',
      c.avatar_color || '#0078d4',
      c.avatar_url || '',
      c.notes || '',
      c.birthday || '',
      c.website || '',
      c.created_at || new Date().toISOString(),
      c.updated_at || new Date().toISOString(),
    ]);
  }
  insertContact.free();

  const insertActivity = db.prepare(`
    INSERT INTO activity_logs (id, contact_id, type, summary, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const act of SEED_ACTIVITY) {
    insertActivity.run([
      act.id || `act-${Date.now()}`,
      act.contact_id || '',
      act.type || 'note',
      act.summary || '',
      act.timestamp || new Date().toISOString(),
    ]);
  }
  insertActivity.free();
}

export async function persistDatabase(): Promise<void> {
  if (!dbInstance) return;
  const binary = dbInstance.export();
  await saveToIDB(binary);
}

// Contacts CRUD
export async function getContacts(
  categoryFilter: string = 'All',
  searchQuery: string = '',
  sortField: SortField = 'name_asc'
): Promise<Contact[]> {
  const db = await getSqliteDatabase();
  
  let query = `SELECT * FROM contacts WHERE 1=1`;
  const params: any[] = [];

  if (categoryFilter === 'Favorites') {
    query += ` AND is_favorite = 1`;
  } else if (categoryFilter !== 'All') {
    query += ` AND category = ?`;
    params.push(categoryFilter);
  }

  if (searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    query += ` AND (
      display_name LIKE ? OR 
      email LIKE ? OR 
      phone LIKE ? OR 
      company LIKE ? OR 
      job_title LIKE ? OR 
      notes LIKE ?
    )`;
    params.push(term, term, term, term, term, term);
  }

  switch (sortField) {
    case 'name_desc':
      query += ` ORDER BY LOWER(SUBSTR(TRIM(COALESCE(NULLIF(first_name, ''), display_name, '')), 1, 1)) DESC, LOWER(TRIM(COALESCE(NULLIF(first_name, ''), display_name, ''))) DESC, LOWER(last_name) DESC`;
      break;
    case 'company':
      query += ` ORDER BY LOWER(company) ASC, LOWER(TRIM(COALESCE(NULLIF(first_name, ''), display_name, ''))) ASC`;
      break;
    case 'recent':
      query += ` ORDER BY updated_at DESC`;
      break;
    case 'name_asc':
    default:
      query += ` ORDER BY LOWER(SUBSTR(TRIM(COALESCE(NULLIF(first_name, ''), display_name, '')), 1, 1)) ASC, LOWER(TRIM(COALESCE(NULLIF(first_name, ''), display_name, ''))) ASC, LOWER(last_name) ASC`;
      break;
  }

  const stmt = db.prepare(query);
  stmt.bind(params);
  const contacts: Contact[] = [];
  while (stmt.step()) {
    contacts.push(stmt.getAsObject() as unknown as Contact);
  }
  stmt.free();

  if (sortField === 'name_asc') {
    contacts.sort((a, b) => {
      const nameA = (a.first_name?.trim() || a.display_name?.trim() || '').trim();
      const nameB = (b.first_name?.trim() || b.display_name?.trim() || '').trim();
      const firstCharA = nameA.charAt(0).toLowerCase();
      const firstCharB = nameB.charAt(0).toLowerCase();
      if (firstCharA !== firstCharB) {
        return firstCharA.localeCompare(firstCharB);
      }
      return nameA.localeCompare(nameB);
    });
  } else if (sortField === 'name_desc') {
    contacts.sort((a, b) => {
      const nameA = (a.first_name?.trim() || a.display_name?.trim() || '').trim();
      const nameB = (b.first_name?.trim() || b.display_name?.trim() || '').trim();
      const firstCharA = nameA.charAt(0).toLowerCase();
      const firstCharB = nameB.charAt(0).toLowerCase();
      if (firstCharA !== firstCharB) {
        return firstCharB.localeCompare(firstCharA);
      }
      return nameB.localeCompare(nameA);
    });
  }

  return contacts;
}

export async function getContactById(id: string): Promise<Contact | null> {
  const db = await getSqliteDatabase();
  const stmt = db.prepare(`SELECT * FROM contacts WHERE id = ? LIMIT 1`);
  stmt.bind([id]);
  let contact: Contact | null = null;
  if (stmt.step()) {
    contact = stmt.getAsObject() as unknown as Contact;
  }
  stmt.free();
  return contact;
}

export async function createContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
  const db = await getSqliteDatabase();
  const id = 'c-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();
  const displayName = contact.display_name?.trim() || `${contact.first_name} ${contact.last_name}`.trim();

  db.run(`
    INSERT INTO contacts (
      id, first_name, last_name, display_name, email, secondary_email,
      phone, work_phone, company, job_title, department, category,
      is_favorite, address_street, address_city, address_state, address_zip,
      address_country, avatar_color, avatar_url, notes, birthday, website,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `, [
    id,
    contact.first_name,
    contact.last_name,
    displayName,
    contact.email || '',
    contact.secondary_email || '',
    contact.phone || '',
    contact.work_phone || '',
    contact.company || '',
    contact.job_title || '',
    contact.department || '',
    contact.category || 'All',
    contact.is_favorite ? 1 : 0,
    contact.address_street || '',
    contact.address_city || '',
    contact.address_state || '',
    contact.address_zip || '',
    contact.address_country || '',
    contact.avatar_color || '#0078d4',
    contact.avatar_url || '',
    contact.notes || '',
    contact.birthday || '',
    contact.website || '',
    now,
    now
  ]);

  // Log contact creation in SQLite activity
  db.run(`
    INSERT INTO activity_logs (id, contact_id, type, summary, timestamp)
    VALUES (?, ?, 'note', ?, ?)
  `, [
    'act-' + Date.now(),
    id,
    `Contact created in SQLite storage with category '${contact.category || 'All'}'.`,
    now
  ]);

  await persistDatabase();
  const created = await getContactById(id);
  return created!;
}

export async function updateContact(contact: Contact): Promise<Contact> {
  const db = await getSqliteDatabase();
  const now = new Date().toISOString();
  const displayName = contact.display_name?.trim() || `${contact.first_name} ${contact.last_name}`.trim();

  db.run(`
    UPDATE contacts SET
      first_name = ?,
      last_name = ?,
      display_name = ?,
      email = ?,
      secondary_email = ?,
      phone = ?,
      work_phone = ?,
      company = ?,
      job_title = ?,
      department = ?,
      category = ?,
      is_favorite = ?,
      address_street = ?,
      address_city = ?,
      address_state = ?,
      address_zip = ?,
      address_country = ?,
      avatar_color = ?,
      avatar_url = ?,
      notes = ?,
      birthday = ?,
      website = ?,
      updated_at = ?
    WHERE id = ?
  `, [
    contact.first_name,
    contact.last_name,
    displayName,
    contact.email || '',
    contact.secondary_email || '',
    contact.phone || '',
    contact.work_phone || '',
    contact.company || '',
    contact.job_title || '',
    contact.department || '',
    contact.category || 'All',
    contact.is_favorite ? 1 : 0,
    contact.address_street || '',
    contact.address_city || '',
    contact.address_state || '',
    contact.address_zip || '',
    contact.address_country || '',
    contact.avatar_color || '#0078d4',
    contact.avatar_url || '',
    contact.notes || '',
    contact.birthday || '',
    contact.website || '',
    now,
    contact.id
  ]);

  await persistDatabase();
  const updated = await getContactById(contact.id);
  return updated!;
}

export async function deleteContact(id: string): Promise<void> {
  const db = await getSqliteDatabase();
  db.run(`DELETE FROM activity_logs WHERE contact_id = ?`, [id]);
  db.run(`DELETE FROM contacts WHERE id = ?`, [id]);
  await persistDatabase();
}

export async function bulkDeleteContacts(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM activity_logs WHERE contact_id IN (${placeholders})`, ids);
  db.run(`DELETE FROM contacts WHERE id IN (${placeholders})`, ids);
  await persistDatabase();
}

export async function bulkUpdateCategory(ids: string[], newCategory: string): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();
  db.run(`UPDATE contacts SET category = ?, updated_at = ? WHERE id IN (${placeholders})`, [newCategory, now, ...ids]);

  for (const id of ids) {
    db.run(
      `INSERT INTO activity_logs (id, contact_id, type, summary, timestamp) VALUES (?, ?, 'note', ?, ?)`,
      ['act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6), id, `Category changed to '${newCategory}' via bulk update`, now]
    );
  }
  await persistDatabase();
}

export async function bulkToggleFavorite(ids: string[], isFavorite: boolean): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();
  const favVal = isFavorite ? 1 : 0;
  db.run(`UPDATE contacts SET is_favorite = ?, updated_at = ? WHERE id IN (${placeholders})`, [favVal, now, ...ids]);
  await persistDatabase();
}

export async function toggleFavorite(id: string, current: number): Promise<number> {
  const db = await getSqliteDatabase();
  const next = current ? 0 : 1;
  const now = new Date().toISOString();
  db.run(`UPDATE contacts SET is_favorite = ?, updated_at = ? WHERE id = ?`, [next, now, id]);
  await persistDatabase();
  return next;
}

// Activity Logs
export async function getActivityLogs(contactId: string): Promise<ActivityLog[]> {
  const db = await getSqliteDatabase();
  const stmt = db.prepare(`SELECT * FROM activity_logs WHERE contact_id = ? ORDER BY timestamp DESC`);
  stmt.bind([contactId]);
  const logs: ActivityLog[] = [];
  while (stmt.step()) {
    logs.push(stmt.getAsObject() as unknown as ActivityLog);
  }
  stmt.free();
  return logs;
}

export async function addActivityLog(
  contactId: string,
  type: ActivityLog['type'],
  summary: string
): Promise<ActivityLog> {
  const db = await getSqliteDatabase();
  const id = 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  db.run(`
    INSERT INTO activity_logs (id, contact_id, type, summary, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `, [id, contactId, type, summary, now]);

  db.run(`UPDATE contacts SET updated_at = ? WHERE id = ?`, [now, contactId]);

  await persistDatabase();

  return {
    id,
    contact_id: contactId,
    type,
    summary,
    timestamp: now
  };
}

// Database stats & maintenance
export async function getDatabaseStats() {
  const db = await getSqliteDatabase();
  const countStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorites,
      COUNT(DISTINCT category) as categories
    FROM contacts
  `);
  let total = 0;
  let favorites = 0;
  let categories = 0;
  if (countStmt.step()) {
    const row = countStmt.getAsObject() as any;
    total = Number(row.total) || 0;
    favorites = Number(row.favorites) || 0;
    categories = Number(row.categories) || 0;
  }
  countStmt.free();

  const activityStmt = db.prepare(`SELECT COUNT(*) as count FROM activity_logs`);
  let activities = 0;
  if (activityStmt.step()) {
    activities = Number((activityStmt.getAsObject() as any).count) || 0;
  }
  activityStmt.free();

  const binary = db.export();
  const byteSize = binary.byteLength;

  // Query SQLite version
  let sqliteVersion = '3.x';
  try {
    const vStmt = db.prepare(`SELECT sqlite_version() as ver`);
    if (vStmt.step()) {
      sqliteVersion = (vStmt.getAsObject() as any).ver;
    }
    vStmt.free();
  } catch (e) {
    // ignore
  }

  return {
    total,
    favorites,
    categories,
    activities,
    byteSize,
    sqliteVersion
  };
}

// Export SQLite database as downloadable binary file
export async function exportSqliteBinary(): Promise<Blob> {
  const db = await getSqliteDatabase();
  const binary = db.export();
  return new Blob([binary as any], { type: 'application/vnd.sqlite3' });
}

// Import external SQLite database file
export async function importSqliteBinary(buffer: ArrayBuffer): Promise<void> {
  if (!sqlModule) {
    sqlModule = await initSqlJs();
  }
  const newDb = new sqlModule.Database(new Uint8Array(buffer)) as Database;
  // Verify contacts table exists
  const check = newDb.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'`);
  if (!check.length || !check[0].values.length) {
    throw new Error('Invalid SQLite database: missing "contacts" table structure.');
  }

  if (dbInstance) {
    dbInstance.close();
  }
  dbInstance = newDb;
  await persistDatabase();
}

// Reset to initial seed
export async function resetDatabaseToDefault(): Promise<void> {
  if (!sqlModule) {
    sqlModule = await initSqlJs({
      locateFile: (file: string) => `/${file}`,
    });
  }
  if (dbInstance) {
    dbInstance.close();
  }
  const newDb = new sqlModule.Database() as Database;
  initializeSchema(newDb);
  seedInitialData(newDb);
  dbInstance = newDb;
  await persistDatabase();
}

// Execute arbitrary SQL statement for SQLite Console inspector
export async function executeRawSql(sql: string): Promise<SqlQueryResult> {
  const start = performance.now();
  const db = await getSqliteDatabase();
  try {
    const results = db.exec(sql);
    const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;
    await persistDatabase();

    if (results.length > 0) {
      const first = results[0];
      return {
        columns: first.columns,
        values: first.values,
        rowCount: first.values.length,
        executionTimeMs
      };
    }

    return {
      columns: ['status'],
      values: [['Query executed successfully with 0 rows returned.']],
      rowCount: 0,
      executionTimeMs
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      columns: ['error'],
      values: [[err?.message || 'Unknown SQLite execution error']],
      rowCount: 0,
      executionTimeMs,
      error: err?.message || 'Unknown error'
    };
  }
}

// ==========================================
// FLUENT BOOKMARKS OPERATIONS
// ==========================================

export interface BookmarkFilterOptions {
  category?: string;
  searchQuery?: string;
  sortField?: BookmarkSortField;
  tag?: string;
}

export async function getBookmarks(options: BookmarkFilterOptions = {}): Promise<Bookmark[]> {
  const db = await getSqliteDatabase();
  const { category = 'All', searchQuery = '', sortField = 'recent', tag } = options;

  let query = `SELECT * FROM bookmarks WHERE 1=1`;
  const params: any[] = [];

  if (category === 'Favorites') {
    query += ` AND is_favorite = 1`;
  } else if (category && category !== 'All') {
    query += ` AND category = ?`;
    params.push(category);
  }

  if (searchQuery.trim()) {
    const term = `%${searchQuery.trim()}%`;
    query += ` AND (title LIKE ? OR url LIKE ? OR description LIKE ? OR tags LIKE ? OR category LIKE ?)`;
    params.push(term, term, term, term, term);
  }

  if (tag) {
    query += ` AND tags LIKE ?`;
    params.push(`%"${tag}"%`);
  }

  switch (sortField) {
    case 'title_asc':
      query += ` ORDER BY title ASC`;
      break;
    case 'title_desc':
      query += ` ORDER BY title DESC`;
      break;
    case 'popular':
      query += ` ORDER BY click_count DESC, updated_at DESC`;
      break;
    case 'category':
      query += ` ORDER BY category ASC, title ASC`;
      break;
    case 'recent':
    default:
      query += ` ORDER BY created_at DESC`;
      break;
  }

  const stmt = db.prepare(query);
  if (params.length > 0) {
    stmt.bind(params);
  }

  const bookmarks: Bookmark[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    let parsedTags: string[] = [];
    try {
      if (typeof row.tags === 'string' && row.tags.startsWith('[')) {
        parsedTags = JSON.parse(row.tags);
      } else if (typeof row.tags === 'string') {
        parsedTags = row.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    } catch {
      parsedTags = [];
    }

    bookmarks.push({
      id: row.id,
      title: row.title,
      url: row.url,
      description: row.description || '',
      category: row.category || 'General',
      tags: parsedTags,
      favicon: row.favicon || '',
      is_favorite: Number(row.is_favorite) || 0,
      click_count: Number(row.click_count) || 0,
      created_at: row.created_at,
      updated_at: row.updated_at,
    });
  }
  stmt.free();
  return bookmarks;
}

export async function createBookmark(
  data: Omit<Bookmark, 'id' | 'created_at' | 'updated_at' | 'click_count'>
): Promise<Bookmark> {
  const db = await getSqliteDatabase();
  const id = 'bm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  let favicon = data.favicon;
  if (!favicon && data.url) {
    try {
      const parsedUrl = new URL(data.url);
      favicon = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    } catch {
      favicon = '';
    }
  }

  const tagsJson = JSON.stringify(data.tags || []);

  db.run(
    `INSERT INTO bookmarks (
      id, title, url, description, category, tags, favicon, is_favorite, click_count, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      data.title,
      data.url,
      data.description || '',
      data.category || 'General',
      tagsJson,
      favicon || '',
      data.is_favorite ? 1 : 0,
      now,
      now,
    ]
  );

  await persistDatabase();

  return {
    id,
    title: data.title,
    url: data.url,
    description: data.description || '',
    category: data.category || 'General',
    tags: data.tags || [],
    favicon: favicon || '',
    is_favorite: data.is_favorite ? 1 : 0,
    click_count: 0,
    created_at: now,
    updated_at: now,
  };
}

export async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<void> {
  const db = await getSqliteDatabase();
  const now = new Date().toISOString();

  const setClauses: string[] = ['updated_at = ?'];
  const values: any[] = [now];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    values.push(updates.title);
  }
  if (updates.url !== undefined) {
    setClauses.push('url = ?');
    values.push(updates.url);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description);
  }
  if (updates.category !== undefined) {
    setClauses.push('category = ?');
    values.push(updates.category);
  }
  if (updates.tags !== undefined) {
    setClauses.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.favicon !== undefined) {
    setClauses.push('favicon = ?');
    values.push(updates.favicon);
  }
  if (updates.is_favorite !== undefined) {
    setClauses.push('is_favorite = ?');
    values.push(updates.is_favorite ? 1 : 0);
  }

  values.push(id);
  db.run(`UPDATE bookmarks SET ${setClauses.join(', ')} WHERE id = ?`, values);
  await persistDatabase();
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getSqliteDatabase();
  db.run(`DELETE FROM bookmarks WHERE id = ?`, [id]);
  await persistDatabase();
}

export async function bulkDeleteBookmarks(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  db.run(`DELETE FROM bookmarks WHERE id IN (${placeholders})`, ids);
  await persistDatabase();
}

export async function bulkUpdateBookmarkCategory(ids: string[], newCategory: string): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();
  db.run(`UPDATE bookmarks SET category = ?, updated_at = ? WHERE id IN (${placeholders})`, [
    newCategory,
    now,
    ...ids,
  ]);
  await persistDatabase();
}

export async function bulkToggleBookmarkFavorite(ids: string[], isFavorite: boolean): Promise<void> {
  if (!ids.length) return;
  const db = await getSqliteDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const now = new Date().toISOString();
  db.run(`UPDATE bookmarks SET is_favorite = ?, updated_at = ? WHERE id IN (${placeholders})`, [
    isFavorite ? 1 : 0,
    now,
    ...ids,
  ]);
  await persistDatabase();
}

export async function toggleBookmarkFavorite(id: string, current: number): Promise<number> {
  const db = await getSqliteDatabase();
  const next = current ? 0 : 1;
  const now = new Date().toISOString();
  db.run(`UPDATE bookmarks SET is_favorite = ?, updated_at = ? WHERE id = ?`, [next, now, id]);
  await persistDatabase();
  return next;
}

export async function incrementBookmarkClick(id: string): Promise<void> {
  const db = await getSqliteDatabase();
  db.run(`UPDATE bookmarks SET click_count = click_count + 1 WHERE id = ?`, [id]);
  await persistDatabase();
}

export async function getBookmarkStats() {
  const db = await getSqliteDatabase();
  const countStmt = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorites
    FROM bookmarks
  `);
  let total = 0;
  let favorites = 0;
  if (countStmt.step()) {
    const row = countStmt.getAsObject() as any;
    total = Number(row.total) || 0;
    favorites = Number(row.favorites) || 0;
  }
  countStmt.free();

  const catStmt = db.prepare(`SELECT category, COUNT(*) as count FROM bookmarks GROUP BY category`);
  const categoryCounts: Record<string, number> = {};
  while (catStmt.step()) {
    const row = catStmt.getAsObject() as any;
    if (row.category) {
      categoryCounts[row.category] = Number(row.count) || 0;
    }
  }
  catStmt.free();

  return { total, favorites, categoryCounts };
}

