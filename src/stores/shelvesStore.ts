import { create } from 'zustand';
import type { Shelf, ShelfWithBookCount } from '../../shared/types/shelf';
import type { Book } from '../../shared/types/book';

interface ShelvesState {
  shelves: ShelfWithBookCount[];
  smartShelves: ShelfWithBookCount[];
  currentShelfBooks: Book[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadShelves: () => Promise<void>;
  loadSmartShelves: () => Promise<void>;
  createShelf: (name: string, color?: string, icon?: string) => Promise<Shelf>;
  updateShelf: (shelfId: string, updates: Partial<Shelf>) => Promise<void>;
  deleteShelf: (shelfId: string) => Promise<void>;
  loadShelfBooks: (shelfId: string, isSmart?: boolean) => Promise<void>;
  addBookToShelf: (shelfId: string, bookId: string) => Promise<void>;
  removeBookFromShelf: (shelfId: string, bookId: string) => Promise<void>;
}

export const useShelvesStore = create<ShelvesState>((set, get) => ({
  shelves: [],
  smartShelves: [],
  currentShelfBooks: [],
  loading: false,
  error: null,

  loadShelves: async () => {
    try {
      set({ loading: true, error: null });
      const shelves = await window.api.getAllShelves();
      set({ shelves, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shelves';
      set({ error: message, loading: false });
      console.error('Load shelves error:', error);
    }
  },

  loadSmartShelves: async () => {
    try {
      const smartShelves = await window.api.getSmartShelves();
      set({ smartShelves });
    } catch (error) {
      console.error('Load smart shelves error:', error);
    }
  },

  createShelf: async (name: string, color?: string, icon?: string) => {
    try {
      set({ loading: true, error: null });
      const shelf = await window.api.createShelf(name, color, icon);
      await get().loadShelves(); // Reload to get bookCount
      set({ loading: false });
      return shelf;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create shelf';
      set({ error: message, loading: false });
      console.error('Create shelf error:', error);
      throw error;
    }
  },

  updateShelf: async (shelfId: string, updates: Partial<Shelf>) => {
    try {
      set({ loading: true, error: null });
      await window.api.updateShelf(shelfId, updates);
      await get().loadShelves();
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update shelf';
      set({ error: message, loading: false });
      console.error('Update shelf error:', error);
      throw error;
    }
  },

  deleteShelf: async (shelfId: string) => {
    try {
      set({ loading: true, error: null });
      await window.api.deleteShelf(shelfId);
      await get().loadShelves();
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete shelf';
      set({ error: message, loading: false });
      console.error('Delete shelf error:', error);
      throw error;
    }
  },

  loadShelfBooks: async (shelfId: string, isSmart = false) => {
    try {
      set({ loading: true, error: null });
      const books = isSmart
        ? await window.api.getSmartShelfBooks(shelfId)
        : await window.api.getShelfBooks(shelfId);
      set({ currentShelfBooks: books, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load shelf books';
      set({ error: message, loading: false });
      console.error('Load shelf books error:', error);
    }
  },

  addBookToShelf: async (shelfId: string, bookId: string) => {
    try {
      await window.api.addBookToShelf(shelfId, bookId);
      await get().loadShelves(); // Reload to update bookCount
    } catch (error) {
      console.error('Add book to shelf error:', error);
      throw error;
    }
  },

  removeBookFromShelf: async (shelfId: string, bookId: string) => {
    try {
      await window.api.removeBookFromShelf(shelfId, bookId);
      await get().loadShelves(); // Reload to update bookCount
      // Also update currentShelfBooks if we're viewing this shelf
      const currentBooks = get().currentShelfBooks;
      set({ currentShelfBooks: currentBooks.filter((b) => b.id !== bookId) });
    } catch (error) {
      console.error('Remove book from shelf error:', error);
      throw error;
    }
  },
}));
