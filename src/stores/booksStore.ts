import { create } from 'zustand';
import type { Book, SortOption, ViewMode } from '../../shared/types/book';

interface BooksState {
  books: Book[];
  isLoading: boolean;
  searchQuery: string;
  sortBy: SortOption;
  viewMode: ViewMode;
  
  // Actions
  loadBooks: () => Promise<void>;
  importBooks: (filePaths: string[]) => Promise<void>;
  updateBook: (id: string, updates: { title?: string; author?: string }) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Computed
  getFilteredBooks: () => Book[];
}

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  isLoading: true,
  searchQuery: '',
  sortBy: 'recent',
  viewMode: 'grid',

  loadBooks: async () => {
    try {
      set({ isLoading: true });
      const books = await window.api.getBooks();
      set({ books, isLoading: false });
    } catch (error) {
      console.error('Failed to load books:', error);
      set({ isLoading: false });
    }
  },

  importBooks: async (filePaths: string[]) => {
    for (const filePath of filePaths) {
      try {
        const result = await window.api.importBook(filePath);
        if (result.success && result.book) {
          set((state) => ({ books: [result.book!, ...state.books] }));
        } else {
          console.error('Failed to import book:', result.error);
        }
      } catch (error) {
        console.error('Failed to import book:', error);
      }
    }
  },

  updateBook: async (id: string, updates: { title?: string; author?: string }) => {
    try {
      const updatedBook = await window.api.updateBook(id, updates);
      if (updatedBook) {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? updatedBook : book
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to update book:', error);
      throw error;
    }
  },

  deleteBook: async (id: string) => {
    try {
      const deleted = await window.api.deleteBook(id);
      if (deleted) {
        set((state) => ({
          books: state.books.filter((book) => book.id !== id),
        }));
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSortBy: (sort: SortOption) => set({ sortBy: sort }),
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  getFilteredBooks: () => {
    const { books, searchQuery, sortBy } = get();
    
    let filtered = books;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query)
      );
    }
    
    // Sort books
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'recent':
        default:
          const aDate = a.lastOpenedAt || a.importedAt;
          const bDate = b.lastOpenedAt || b.importedAt;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
      }
    });
    
    return sorted;
  },
}));
