export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  tags?: string[];
  favicon?: string;
  is_favorite: number; // 0 or 1
  click_count: number;
  created_at: string;
  updated_at: string;
}

export type BookmarkViewMode = 'grid' | 'table' | 'compact';
export type BookmarkSortField = 'recent' | 'title_asc' | 'title_desc' | 'popular' | 'category';
