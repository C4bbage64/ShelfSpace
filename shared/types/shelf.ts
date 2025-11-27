// Shelf types
export interface Shelf {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  isSmart?: boolean;
}

export interface ShelfWithBookCount extends Shelf {
  bookCount: number;
}

export interface BookShelf {
  id: string;
  bookId: string;
  shelfId: string;
  addedAt: string;
}

export interface SmartShelfConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  query: (books: any[]) => any[];
}

export type SmartShelfType = 'recent' | 'in-progress' | 'unread' | 'finished' | 'large';
