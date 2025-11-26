// Notes and highlights types
export interface Note {
  id: string;
  bookId: string;
  content: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  text: string;
  location: string;
  color: string;
  createdAt: string;
}
