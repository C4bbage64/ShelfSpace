// Book types
export interface Book {
  id: string;
  title: string;
  author: string;
  type: 'pdf' | 'epub' | 'txt';
  pages?: number;
  coverPath: string | null;
  filePath: string;
  importedAt: string;
  lastOpenedAt: string | null;
}

export interface BookImportResult {
  success: boolean;
  book?: Book;
  error?: string;
}

export type SortOption = 'recent' | 'title' | 'author';
export type ViewMode = 'grid' | 'list';
