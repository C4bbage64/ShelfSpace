// Reading progress types
export interface ReadingProgress {
  bookId: string;
  location: string; // Page number for PDF, CFI for EPUB
  percentage: number;
  timestamp: string;
}
